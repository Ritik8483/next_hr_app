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
import { MTE, deleteFeedbackFormCode, limit } from "@/constants/constant";
import {
  useDeleteFeedbackFormMutation,
  useGetAllGenerateFeedbackFormQuery,
  useSendEmailMutation,
} from "@/redux/api/api";

const tableHeadings = [
  "S.No.",
  "Feedback Name",
  "Feedback Type",
  "Created At",
  "Actions",
];

const GenerateFeedback = () => {
  const router: any = useRouter();
  const dispatch = useDispatch();
  const formRef: any = useRef<HTMLInputElement[] | null>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [publishFormId, setPublishFormId] = useState<string>("");
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
  const [sendEmail] = useSendEmailMutation();
  const [deleteFeedbackForm] = useDeleteFeedbackFormMutation();

  const handleAddUser = () => {
    setFeedbackFormDetail({});
    setFeedbackFormModal(true);
  };

  const handleRowClick = (item: any) => {
    router.push(`/generate/${item._id}`);
  };

  const handleSubmit = (item: any) => {
    setPublishFormId(item._id);
    setIsSubmitting(true);
    try {
      item.reviewer.map(async (it: any, index: number) => {
        const payload = {
          url: "send",
          body: {
            email: it.email,
            emailUrl: `${process.env.NEXT_PUBLIC_LOCAL_SERVER}form?id=${item._id}?user=${it._id}`,
          },
        };
        const resp = await sendEmail(payload).unwrap();
        if (index === 0 && resp?.code === 5000) {
          dispatch(
            openAlert({
              type: "success",
              message: resp.message,
            })
          );
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.log("error", error);
    }
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
        <SearchField
          setSearchText={setSearchText}
          searchText={searchText}
          placeholder="Search feedback by name"
        />
        <Box></Box>
        <Buttons
          text="Create Form"
          sx={{ textTransform: "capitalize" }}
          onClick={handleAddUser}
        />
      </Box>

      {isLoading ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : !data?.data?.length ? (
        <NoDataFound text="No data Found" />
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
                  const date: any = String(new Date(item.date)).split("GMT")[0];
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
                        {item.feedbackName}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {item.feedback_type}
                      </StyledTableCell>
                      <StyledTableCell align="center">{date}</StyledTableCell>

                      {/* <StyledTableCell align="center">{date}</StyledTableCell> */}
                      {/* <StyledTableCell align="center">
                        {item?.review?.length > 3
                          ? item.review
                              ?.slice(0, 3)
                              ?.map(
                                (it: any) =>
                                  it.teamName ||
                                  it.firstName + " " + it.lastName
                              )
                              .toString() + "..."
                          : item.review
                              ?.map(
                                (it: any) =>
                                  it.teamName ||
                                  it.firstName + " " + it.lastName
                              )
                              .toString()}
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
                      </StyledTableCell> */}
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
                            disabled={
                              publishFormId === item._id && isSubmitting
                            }
                            text={
                              publishFormId === item._id && isSubmitting
                                ? "Publishing..."
                                : "Publish"
                            }
                            size="small"
                            onClick={() => handleSubmit(item)}
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
            openAlertBox.data?.review?.length > 3
              ? openAlertBox.data?.review
                  ?.slice(0, 2)
                  ?.map(
                    (it: any) => it.teamName || it.firstName + " " + it.lastName
                  )
                  .toString() + "..."
              : openAlertBox.data?.review
                  ?.map(
                    (it: any) => it.teamName || it.firstName + " " + it.lastName
                  )
                  .toString()
          }
          onClose={handleClose}
          handleClick={handleDeleteFeedbackForm}
        />
      )}
    </>
  );
};

export default GenerateFeedback;
