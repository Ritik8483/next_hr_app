"use client";

import React, { useState } from "react";
import { Box, Switch, Typography } from "@mui/material";
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
  const [checked, setChecked] = useState(false);
  const [feedbackDetail, setFeedbackDetail] = useState({});
  const [feedbackGroupDetail, setFeedbackGroupDetail] = useState({});
  const [openAlertBox, setOpenAlertBox] = useState<any>({
    data: {},
    state: false,
  });

  const debouncedValue = useDebounce(searchText, 500);

  const payload = {
    url: "feedback-parameters",
    page: currentPage,
    limit: limit,
    search: !checked && (debouncedValue || ""),
  };

  const payloadFeedback = {
    url: "group-parameters",
    page: currentPage,
    limit: limit,
    search: checked && (debouncedValue || ""),
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

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    dispatch(setFeedbackSwitch(e.target.checked));
    setSearchText("");
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

      <Box display="flex" alignItems="center" gap="5px" marginBottom="20px">
        <Typography color={!checked ? "#1976D2" : "grey"}>Feedbacks</Typography>
        <Switch checked={checked} onChange={handleSwitchChange} />
        <Typography color={checked ? "#1976D2" : "grey"}>
          Group Feedbacks
        </Typography>
      </Box>

      {isLoading ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : !data?.data?.length ? (
        <NoDataFound text="No data Found" />
      ) : data?.data?.length && !checked ? (
        <FeedbackParameterTable
          data={data}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleRowClick={handleRowClick}
          handleEdit={handleEdit}
          setOpenAlertBox={setOpenAlertBox}
        />
      ) : data?.data?.length && checked ? (
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
            checked
              ? "Are you sure you want to delete this feedback group?"
              : "Are you sure you want to delete this feedback?"
          }
          // userName={openAlertBox.data.feedbackName}
          onClose={handleClose}
          handleClick={
            checked ? handleDeleteGroupFeedback : handleDeleteFeedback
          }
        />
      )}
    </>
  );
};

export default Feedbacks;
