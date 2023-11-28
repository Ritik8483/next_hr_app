"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import emailjs from "@emailjs/browser";
import SearchField from "@/components/resuseables/SearchField";
import Buttons from "@/components/resuseables/Buttons";
import GenerateFeedbackModal from "./GenerateFeedbackModal";
import NoDataFound from "@/components/resuseables/NoDataFound";
import useDebounce from "@/components/hooks/useDebounce";
import PaginationTable from "@/components/resuseables/Pagination";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { StyledTableCell, StyledTableRow } from "@/styles/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
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
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";
import AlertBox from "@/components/resuseables/AlertBox";

const tableHeadings = ["S.No.", "Feedback Type", "Person to review", "Actions"];

const GenerateFeedback = () => {
  const router: any = useRouter();
  const dispatch = useDispatch();
  const formRef: any = useRef<HTMLInputElement[] | null>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [publishFormId, setPublishFormId] = useState<number>();
  const [feedbackFormModal, setFeedbackFormModal] = useState<boolean>(false);
  const [feedbackFormDetail, setFeedbackFormDetail] = useState({});
  const [totalCount, setTotalCount] = useState<number>();
  const [offset, setOffset] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [prevOffset, setPrevOffset] = useState<number>(0);
  const [totalNoOfItems, setTotalNoOfItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackFormList, setFeedbackFormList] = useState<any>([]);
  const [openAlertBox, setOpenAlertBox] = useState<any>({
    data: {},
    state: false,
  });

  const debouncedValue = useDebounce(searchText, 500);

  const handleAddUser = () => {
    setFeedbackFormDetail({});
    setFeedbackFormModal(true);
  };

  const handleRowClick = (item: any) => {
    router.push(`/generate-feedback/${item.id}`);
  };

  const getFeedbacksData = async () => {
    if (debouncedValue.length > 0) {
      const usersRef = collection(db, "feedback_form");
      const querySearch = query(
        usersRef,
        or(where("feedback_type", "==", debouncedValue))
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
      setFeedbackFormList(feedbacksArr);
    } else {
      const querySnapshot: any = await getDocs(collection(db, "feedback_form"));
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
      setFeedbackFormList(allFeedbacksData);
    }
  };
  useEffect(() => {
    getFeedbacksData();
  }, [feedbackFormModal, openAlertBox, currentPage, debouncedValue]);

  const handleSubmit = (e: any, index: number) => {
    e.preventDefault();
    setPublishFormId(index);
    setIsSubmitting(true);
    emailjs
      .sendForm(
        "service_45awfi4",
        "template_7qrcsmx",
        formRef?.current[index],
        "jJk8j_-FYjBGKH0Kv"
      )
      .then(
        (result) => {
          dispatch(
            openAlert({
              type: "success",
              message: "Mail sent",
            })
          );
          setIsSubmitting(false);
        },
        (error) => {
          dispatch(
            openAlert({
              type: "error",
              message: error.text,
            })
          );
          setIsSubmitting(false);
        }
      );
  };

  const handleEdit = (item: any) => {
    setFeedbackFormDetail(item);
    setFeedbackFormModal(true);
  };

  const handleClose = (value: string) => {
    setOpenAlertBox({
      state: false,
      data: {},
    });
  };

  const handleDeleteFeedbackForm = async () => {
    await deleteDoc(doc(db, "feedback_form", openAlertBox.data.id));
    dispatch(
      openAlert({
        type: "success",
        message: "Feedback form deleted successfully!",
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
          text="Create Form"
          sx={{ textTransform: "capitalize" }}
          onClick={handleAddUser}
        />
      </Box>

      {!feedbackFormList?.length ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : feedbackFormList?.length ? (
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
                {feedbackFormList.map((item: any, index: number) => (
                  <StyledTableRow
                    onClick={() => handleRowClick(item)}
                    key={item.id}
                  >
                    <StyledTableCell component="th" scope="row">
                      {currentPage === 1 ? index + 1 : prevOffset + index + 1}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.feedback_type}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.review.firstName + " " + item.review.lastName}
                    </StyledTableCell>
                    <StyledTableCell
                      align="right"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <Box
                        display="flex"
                        gap="15px"
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <form
                          ref={(el: any) => {
                            if (formRef?.current) {
                              formRef.current.push(el);
                            }
                          }}
                          key={item.id}
                          onSubmit={(e: any) => handleSubmit(e, index)}
                        >
                          <input
                            name="to_email"
                            defaultValue={item.reviewerEmails}
                            style={{ visibility: "hidden" }}
                          />
                          <input
                            name="message"
                            defaultValue={`http://localhost:3000/${item.id}/user-login`}
                            style={{ visibility: "hidden" }}
                          />
                          <input
                            name="user_name"
                            defaultValue={
                              item.review.firstName + " " + item.review.lastName
                            }
                            style={{ visibility: "hidden" }}
                          />
                          <Buttons
                            variant="contained"
                            disabled={publishFormId === index && isSubmitting}
                            text={
                              publishFormId === index && isSubmitting
                                ? "Publishing..."
                                : "Publish"
                            }
                            size="small"
                            type="submit"
                          />
                        </form>
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

      {feedbackFormModal && (
        <GenerateFeedbackModal
          feedbackFormModal={feedbackFormModal}
          onClose={() => setFeedbackFormModal(false)}
          feedbackFormDetail={feedbackFormDetail}
        />
      )}

      {openAlertBox && (
        <AlertBox
          open={openAlertBox.state}
          cancelText="No Cancel"
          confirmText="Yes Delete"
          mainHeaderText="Are you sure you want to delete feedback form for "
          userName={
            openAlertBox.data.review?.firstName +
            " " +
            openAlertBox.data.review?.lastName
          }
          onClose={handleClose}
          handleClick={handleDeleteFeedbackForm}
        />
      )}
    </>
  );
};

export default GenerateFeedback;
