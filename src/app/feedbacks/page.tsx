"use client";

import React, { useState } from "react";
import {
  Box,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchField from "@/components/resuseables/SearchField";
import Buttons from "@/components/resuseables/Buttons";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import AlertBox from "@/components/resuseables/AlertBox";
import AddFeedbacksModal from "./AddFeedbacksModal";
import useDebounce from "@/components/hooks/useDebounce";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import NoDataFound from "@/components/resuseables/NoDataFound";
import { openAlert } from "@/redux/slices/snackBarSlice";
import {
  deleteFeedbackParameterCode,
  deleteGroupFeedbackCode,
  limit,
} from "@/constants/constant";
import {
  useDeleteFeedbackFormGroupMutation,
  useDeleteFeedbackParameterMutation,
  useGetAllFeedbackGroupsQuery,
  useGetAllFeedbackParametersQuery,
} from "@/redux/api/api";
import { setFeedbackSwitch } from "@/redux/slices/authSlice";
import GroupFeedbackModal from "./GroupFeedbackModal";
import FeedbackParameterTable from "./FeedbackParameterTable";
import GroupParametersTable from "./GroupParametersTable";

const Feedbacks = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>("");
  const [openFeedbackModal, setOpenFeedbackModal] = useState<boolean>(false);
  const [openFeedbackGroupModal, setOpenFeedbackGroupModal] =
    useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackDetail, setFeedbackDetail] = useState({});
  const [feedbackGroupDetail, setFeedbackGroupDetail] = useState({});
  const [openAlertBox, setOpenAlertBox] = useState<any>({
    data: {},
    state: false,
  });
  const [alignment, setAlignment] = useState("Feedbacks");

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    setSearchText("");
    setAlignment(newAlignment);
  };

  const debouncedValue = useDebounce(searchText, 500);

  const payload = {
    url: "feedback-parameters",
    page: currentPage,
    limit: limit,
    search: alignment === "Feedbacks" && (debouncedValue || ""),
  };

  const payloadFeedback = {
    url: "group-parameters",
    page: currentPage,
    limit: limit,
    search: alignment === "Group Feedbacks" && (debouncedValue || ""),
  };
  const { data, isLoading, error } = useGetAllFeedbackParametersQuery(payload);

  const { data: feedbackGroupsData } =
    useGetAllFeedbackGroupsQuery(payloadFeedback);

  const [deleteFeedbackParameter] = useDeleteFeedbackParameterMutation();
  const [deleteFeedbackFormGroup] = useDeleteFeedbackFormGroupMutation();

  const handleAddFeedback = () => {
    setFeedbackDetail({});
    setOpenFeedbackModal(true);
  };

  const handleAddGroupFeedback = () => {
    setFeedbackGroupDetail({});
    setOpenFeedbackGroupModal(true);
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

  const handleGroupEdit = (item: any) => {
    setFeedbackGroupDetail(item);
    setOpenFeedbackGroupModal(true);
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

  const handleDeleteGroupFeedback = async () => {
    try {
      const payload = {
        url: "group-parameters",
        id: openAlertBox.data._id,
      };
      const resp = await deleteFeedbackFormGroup(payload).unwrap();
      if (resp?.code === deleteGroupFeedbackCode) {
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
        <Box display="flex" gap="20px" alignItems="center">
          <Buttons
            text="Group Feedback"
            sx={{ textTransform: "capitalize" }}
            onClick={handleAddGroupFeedback}
          />
          <Buttons
            text="Add Feedback"
            sx={{ textTransform: "capitalize" }}
            onClick={handleAddFeedback}
          />
        </Box>
      </Box>

      <ToggleButtonGroup
        color="primary"
        value={alignment}
        sx={{ marginBottom: "20px" }}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
      >
        <ToggleButton
          sx={{ textTransform: "capitalize" }}
          value="Feedbacks"
        >
          Feedbacks
        </ToggleButton>
        <ToggleButton
          sx={{ textTransform: "capitalize" }}
          value="Group Feedbacks"
        >
          Group Feedbacks
        </ToggleButton>
      </ToggleButtonGroup>

      {isLoading ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : !data?.data?.length ? (
        <NoDataFound text="No data Found" />
      ) : data?.data?.length && alignment === "Feedbacks" ? (
        <FeedbackParameterTable
          data={data}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleRowClick={handleRowClick}
          handleEdit={handleEdit}
          setOpenAlertBox={setOpenAlertBox}
        />
      ) : data?.data?.length && alignment === "Group Feedbacks" ? (
        <GroupParametersTable
          data={feedbackGroupsData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleRowClick={handleRowClick}
          handleGroupEdit={handleGroupEdit}
          setOpenAlertBox={setOpenAlertBox}
        />
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

      {openFeedbackGroupModal && (
        <GroupFeedbackModal
          openFeedbackGroupModal={openFeedbackGroupModal}
          onClose={() => setOpenFeedbackGroupModal(false)}
          feedbackGroupDetail={feedbackGroupDetail}
        />
      )}

      {openAlertBox && (
        <AlertBox
          open={openAlertBox.state}
          cancelText="No Cancel"
          confirmText="Yes Delete"
          mainHeaderText={
            alignment === "Group Feedbacks"
              ? "Are you sure you want to delete this feedback group?"
              : "Are you sure you want to delete this feedback?"
          }
          // userName={openAlertBox.data.feedbackName}
          onClose={handleClose}
          handleClick={
            alignment === "Group Feedbacks"
              ? handleDeleteGroupFeedback
              : handleDeleteFeedback
          }
        />
      )}
    </>
  );
};

export default Feedbacks;
