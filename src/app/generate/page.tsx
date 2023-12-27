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
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";
import AlertBox from "@/components/resuseables/AlertBox";
import { deleteFeedbackFormCode, limit } from "@/constants/constant";
import {
  useDeleteFeedbackFormMutation,
  useGetAllGenerateFeedbackFormQuery,
} from "@/redux/api/api";

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openAlertBox, setOpenAlertBox] = useState<any>({
    data: {},
    state: false,
  });

  const debouncedValue = useDebounce(searchText, 500);

  const payload = {
    url: "feedback-form",
    page: currentPage,
    limit: limit,
    search: debouncedValue || "",
  };

  const { data, isLoading, error } =
    useGetAllGenerateFeedbackFormQuery(payload);
  const [deleteFeedbackForm] = useDeleteFeedbackFormMutation();

  const handleAddUser = () => {
    setFeedbackFormDetail({});
    setFeedbackFormModal(true);
  };

  const handleRowClick = (item: any) => {
    localStorage.setItem("generateId", JSON.stringify(`/generate/${item._id}`));
    router.push(`/generate/${item._id}`);
  };

  const handleSubmit = (e: any, index: number) => {
    e.preventDefault();
    setPublishFormId(index);
    setIsSubmitting(true);
    console.log(formRef?.current[index]);
    emailjs
      .sendForm(
        `${process.env.NEXT_PUBLIC_EMAIL_SERVICE}`,
        `${process.env.NEXT_PUBLIC_EMAIL_TEMPLATE}`,
        formRef?.current[index],
        `${process.env.NEXT_PUBLIC_EMAIL_KEY}`
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
              message: `${error.text},please try again!`,
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
    try {
      const payload = {
        url: "feedback-form",
        id: openAlertBox.data._id,
      };

      const resp = await deleteFeedbackForm(payload).unwrap();
      if (resp?.code === deleteFeedbackFormCode) {
        dispatch(
          openAlert({
            type: "success",
            message: resp.message,
          })
        );
        setOpenAlertBox(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    formRef.current = formRef.current.slice(0, data?.data?.length);
    data?.data?.forEach((_: any, index: number) => {
      if (!formRef.current[index]) {
        formRef.current[index] = document.createElement("form");
      }
    });
  }, [data?.data?.length]);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="24px"
      >
        {/* <SearchField
          setSearchText={setSearchText}
          searchText={searchText}
          placeholder="Search feedback by name"
        /> */}
        <Box></Box>
        <Buttons
          text="Create Form"
          sx={{ textTransform: "capitalize" }}
          onClick={handleAddUser}
        />
      </Box>

      {!data?.data?.length && data === undefined ? (
        <NoDataFound text="No data Found" />
      ) : isLoading ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : data?.data?.length ? (
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
                {data?.data?.map((item: any, index: number) => {
                  return (
                    <StyledTableRow
                      onClick={() => handleRowClick(item)}
                      key={item._id}
                    >
                      <StyledTableCell component="th" scope="row">
                        {currentPage === 1
                          ? index + 1
                          : limit * currentPage + 1 - limit + index}
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
                          {item?.reviewer?.length > 3
                            ? item?.reviewer
                                ?.slice(0, 3)
                                ?.map((it: any) => (
                                  <Chip
                                    label={it.firstName + " " + it.lastName}
                                  />
                                ))
                            : item?.reviewer?.map((it: any) => (
                                <Chip
                                  label={it.firstName + " " + it.lastName}
                                />
                              ))}
                          {item?.reviewer?.length > 3 && (
                            <Chip
                              sx={{ fontSize: "11px" }}
                              label={
                                "+" +
                                " " +
                                (item?.reviewer?.length - 3) +
                                " " +
                                "more"
                              }
                            />
                          )}
                        </Box>
                        {/* <Box
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
                        </Box> */}
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
                          if (el && formRef.current[index]) {
                            // Update the ref for the corresponding form element
                            formRef.current[index] = el;
                          }
                        }}
                        key={item._id}
                        // onSubmit={(e: any) => handleSubmit(e, index)}
                      >
                        <input
                          name="to_email"
                          defaultValue={item.reviewerEmails}
                          style={{ visibility: "hidden" }}
                        />
                        <input
                          name="message"
                          defaultValue={`${process.env.NEXT_PUBLIC_LOCAL_SERVER}user-login?id=${item._id}`}
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
              totalCount={Math.ceil(data?.total / limit)}
              currentPage={currentPage}
              totalNumber={data?.total}
              setCurrentPage={setCurrentPage}
            />
          </TableContainer>
        </>
      ) : error ? (
        <NoDataFound text="Something went wrong" />
      ) : null}

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
