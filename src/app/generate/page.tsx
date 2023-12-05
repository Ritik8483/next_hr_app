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

const tableHeadings = [
  "S.No.",
  "Feedback Type",
  "Person to review",
  "Reviewers",
  "Actions",
];

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
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
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
    localStorage.setItem("generateId", JSON.stringify(`/generate/${item.id}`));
    router.push(`/generate/${item.id}`);
  };

  const getAllUsers = async (allFeedbacksData: any) => {
    try {
      const usersQuery: any = await getDocs(collection(db, "users"));
      const querySnapshot: any = await getDocs(collection(db, "roles"));
      const allRolesData = querySnapshot?.docs
        ?.reverse()
        ?.slice(prevOffset, offset)
        ?.map((doc: any) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
      const allUsersData = usersQuery?.docs?.map((doc: any) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      const allreviwersId = allFeedbacksData?.map((it: any) => it.reviewer);
      const usersArr = allreviwersId?.map((it: any) => {
        const ff = allUsersData.filter((item: any) => it?.includes(item.id));
        return ff;
      });
      const reviewerDataMap = usersArr
        .flat()
        .reduce((map: any, reviewer: any) => {
          map[reviewer.id] = reviewer;
          return map;
        }, {});

      const newArray = allFeedbacksData.map((entry: any) => {
        return {
          ...entry,
          reviewer: entry.reviewer.map(
            (reviewerId: any) => reviewerDataMap[reviewerId]
          ),
        };
      });
      return newArray;
    } catch (error) {
      console.log("error", error);
    }
  };

  const getFeedbacksData = async () => {
    try {
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
        const data = await getAllUsers(feedbacksArr);
        setFeedbackFormList(data);
        
      } else {
        const querySnapshot: any = await getDocs(
          collection(db, "feedback_form")
        );

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
        const data = await getAllUsers(allFeedbacksData);
        setFeedbackFormList(data);
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

      {!feedbackFormList?.length && isEmpty ? (
        <NoDataFound text="No data Found" />
      ) : !feedbackFormList?.length ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : feedbackFormList?.length ? (
        <>
          <TableContainer component={Paper}>
            <Table aria-label="customized table">
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
                {feedbackFormList.map((item: any, index: number) => {
                  return (
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
                        {Array.isArray(item.review)
                          ? item.review
                              ?.map(
                                (it: any) =>
                                  it.teamName ||
                                  it.firstName + " " + it.lastName
                              )
                              .toString()
                          : item.review.firstName + " " + item.review.lastName}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          {item?.reviewer?.map((it: any) => (
                            <Chip label={it.firstName + " " + it.lastName} />
                          ))}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <Box
                          display="flex"
                          gap="15px"
                          justifyContent="flex-end"
                          alignItems="center"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <Buttons
                            variant="contained"
                            disabled={publishFormId === index && isSubmitting}
                            text={
                              publishFormId === index && isSubmitting
                                ? "Publishing..."
                                : "Publish"
                            }
                            size="small"
                            onClick={(e: any) => handleSubmit(e, index)}
                            type="submit"
                          />
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
                          defaultValue={`http://localhost:3000/user-login?id=${item.id}`}
                          style={{ visibility: "hidden" }}
                        />

                        <input
                          name="user_name"
                          defaultValue={
                            item.review.firstName + " " + item.review.lastName
                          }
                          style={{ visibility: "hidden" }}
                        />
                      </form>
                    </StyledTableRow>
                  );
                })}
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
        null
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
            Array.isArray(openAlertBox.data?.review)
              ? openAlertBox.data?.review
                  ?.map(
                    (it: any) => it.teamName || it.firstName + " " + it.lastName
                  )
                  .toString()
              : openAlertBox.data?.review?.firstName +
                " " +
                openAlertBox.data?.review?.lastName
          }
          onClose={handleClose}
          handleClick={handleDeleteFeedbackForm}
        />
      )}
    </>
  );
};

export default GenerateFeedback;
