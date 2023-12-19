"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import SearchField from "@/components/resuseables/SearchField";
import Buttons from "@/components/resuseables/Buttons";
import { useDispatch } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import AlertBox from "@/components/resuseables/AlertBox";
import AddFeedbacksModal from "./AddFeedbacksModal";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  or,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import useDebounce from "@/components/hooks/useDebounce";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { StyledTableCell, StyledTableRow } from "@/styles/styles";
import NoDataFound from "@/components/resuseables/NoDataFound";
import PaginationTable from "@/components/resuseables/Pagination";
import { openAlert } from "@/redux/slices/snackBarSlice";

const tableHeadings = [
  "S.No.",
  "Feedback Type",
  "Feedback Name",
  "Feedback Description",
  "Actions",
];

const Feedbacks = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>("");
  const [openFeedbackModal, setOpenFeedbackModal] = useState<boolean>(false);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [totalCount, setTotalCount] = useState<number>();
  const [offset, setOffset] = useState<number>(10);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [prevOffset, setPrevOffset] = useState<number>(0);
  const [totalNoOfItems, setTotalNoOfItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackDetail, setFeedbackDetail] = useState({});
  const [openAlertBox, setOpenAlertBox] = useState<any>({
    data: {},
    state: false,
  });

  const debouncedValue = useDebounce(searchText, 500);

  const handleAddUser = () => {
    setFeedbackDetail({});
    setOpenFeedbackModal(true);
  };

  const handleClose = (value: string) => {
    setOpenAlertBox({
      data: {},
      state: false,
    });
  };

  const getFeedbacksData = async () => {
    try {
      if (debouncedValue.length > 0) {
        const usersRef = collection(db, "feedbacks");
        const querySearch = query(
          usersRef,
          or(where("feedbackName", "==", debouncedValue))
        );
        const querySnapshot = await getDocs(querySearch);
        const total: number = Math.ceil(querySnapshot?.docs?.length / 10);
        setTotalNoOfItems(querySnapshot?.docs?.length);
        const feedbacksArr: any = querySnapshot?.docs?.map((doc: any) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setTotalCount(total);
        setFeedbacksList(feedbacksArr);
      } else {
        const querySnapshot: any = await getDocs(collection(db, "feedbacks"));
        const total: number = Math.ceil(querySnapshot?.docs?.length / 10);
        setTotalNoOfItems(querySnapshot?.docs?.length);
        setTotalCount(total);
        const allFeedbacksData = querySnapshot?.docs
          ?.reverse()
          ?.slice(prevOffset, offset)
          ?.map((doc: any) => {
            return {
              id: doc.id,
              ...doc.data(),
            };
          });
        setFeedbacksList(allFeedbacksData);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    getFeedbacksData();
    setTimeout(() => {
      setIsEmpty(true);
    }, 3000);
  }, [openFeedbackModal, openAlertBox, currentPage, debouncedValue]);

  const handleRowClick = (id: string) => {
    localStorage.setItem("generateId", JSON.stringify(`feedbacks/${id}`));
    router.push(`feedbacks/${id}`);
  };

  const handleEdit = (item: any) => {
    setFeedbackDetail(item);
    setOpenFeedbackModal(true);
  };

  const handleDeleteFeedback = async () => {
    try {
      await deleteDoc(doc(db, "feedbacks", openAlertBox.data.id));
      dispatch(
        openAlert({
          type: "success",
          message: "Feedback deleted successfully!",
        })
      );
      if (totalNoOfItems - 1 === prevOffset || totalNoOfItems - 1 === offset) {
        setOffset(offset === 10 ? 10 : offset - 10);
        setPrevOffset(
          prevOffset === 10 || prevOffset === 0 ? 0 : prevOffset - 10
        );
        setCurrentPage(
          totalNoOfItems - 1 === prevOffset || totalNoOfItems - 1 === offset
            ? currentPage - 1
            : currentPage
        );
      }
      setOpenAlertBox(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="24px"
      >
        <SearchField
          setSearchText={setSearchText}
          searchText={searchText}
          placeholder="Search feedback by name"
        />
        <Buttons
          text="Add Feedback"
          sx={{ textTransform: "capitalize" }}
          onClick={handleAddUser}
        />
      </Box>

      {!feedbacksList?.length && isEmpty ? (
        <NoDataFound text="No data Found" />
      ) : !feedbacksList?.length ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : feedbacksList?.length ? (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  {tableHeadings.map((item: string) => (
                    <StyledTableCell
                      align={
                        item === "S.No."
                          ? "left"
                          : item === "Actions"
                          ? "right"
                          : "center"
                      }
                      key={item}
                    >
                      {item}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbacksList.map((item: any, index: number) => (
                  <StyledTableRow
                    onClick={() => handleRowClick(item.id)}
                    key={item.id}
                  >
                    <StyledTableCell component="th" scope="row">
                      {currentPage === 1 ? index + 1 : prevOffset + index + 1}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.feedback_parameter_type}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.feedbackName}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.feedbackDescription}
                    </StyledTableCell>
                    <StyledTableCell
                      align="right"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <Box display="flex" gap="15px" justifyContent="flex-end">
                        <EditIcon
                          onClick={() => handleEdit(item)}
                          sx={{ cursor: "pointer", color: "var(--iconGrey)" }}
                        />
                        <DeleteIcon
                          onClick={() =>
                            setOpenAlertBox({ data: item, state: true })
                          }
                          sx={{ cursor: "pointer", color: "var(--iconGrey)" }}
                        />
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationTable
              prevOffset={prevOffset}
              offset={offset}
              onClick={() => setSearchText("")}
              totalNoOfItems={totalNoOfItems}
              totalCount={totalCount}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setOffset={setOffset}
              setPrevOffset={setPrevOffset}
            />
          </TableContainer>
        </>
      ) : (
        <NoDataFound text="No data Found" />
      )}

      {openFeedbackModal && (
        <AddFeedbacksModal
          openFeedbackModal={openFeedbackModal}
          onClose={() => setOpenFeedbackModal(false)}
          feedbackDetail={feedbackDetail}
        />
      )}

      {openAlertBox && (
        <AlertBox
          open={openAlertBox.state}
          cancelText="No Cancel"
          confirmText="Yes Delete"
          mainHeaderText="Are you sure you want to delete"
          userName={openAlertBox.data.feedbackName}
          onClose={handleClose}
          handleClick={handleDeleteFeedback}
        />
      )}
    </>
  );
};

export default Feedbacks;
