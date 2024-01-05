"use client";

import React, { useState } from "react";
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
import useDebounce from "@/components/hooks/useDebounce";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { StyledTableCell, StyledTableRow } from "@/styles/styles";
import NoDataFound from "@/components/resuseables/NoDataFound";
import PaginationTable from "@/components/resuseables/Pagination";
import { openAlert } from "@/redux/slices/snackBarSlice";
import {
  deleteFeedbackParameterCode,
  limit,
  tableHeadings,
} from "@/constants/constant";
import {
  useDeleteFeedbackParameterMutation,
  useGetAllFeedbackParametersQuery,
} from "@/redux/api/api";

const Feedbacks = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>("");
  const [openFeedbackModal, setOpenFeedbackModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackDetail, setFeedbackDetail] = useState({});
  const [openAlertBox, setOpenAlertBox] = useState<any>({
    data: {},
    state: false,
  });

  const debouncedValue = useDebounce(searchText, 500);

  const payload = {
    url: "feedback-parameters",
    page: currentPage,
    limit: limit,
    search: debouncedValue || "",
  };
  const { data, isLoading, error } = useGetAllFeedbackParametersQuery(payload);
  const [deleteFeedbackParameter] = useDeleteFeedbackParameterMutation();

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

  const handleRowClick = (id: string) => {
    router.push(`feedbacks/${id}`);
  };

  const handleEdit = (item: any) => {
    setFeedbackDetail(item);
    setOpenFeedbackModal(true);
  };

  const handleDeleteFeedback = async () => {
    try {
      const payload = {
        url: "feedback-parameters",
        id: openAlertBox.data._id,
      };
      const resp = await deleteFeedbackParameter(payload).unwrap();
      if (resp?.code === deleteFeedbackParameterCode) {
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
                {data?.data?.map((item: any, index: number) => (
                  <StyledTableRow
                    onClick={() => handleRowClick(item._id)}
                    key={item._id}
                  >
                    <StyledTableCell component="th" scope="row">
                      {currentPage === 1
                        ? index + 1
                        : limit * currentPage + 1 - limit + index}
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
