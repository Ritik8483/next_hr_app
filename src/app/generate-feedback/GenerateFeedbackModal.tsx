"use client";

import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import { modalCrossStyle, modalStyles } from "@/styles/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { Divider, InputLabel, MenuItem } from "@mui/material";
import InputField from "@/components/resuseables/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addFeedbacksSchema, generateFeedbackSchema } from "@/schema/schema";
import Buttons from "@/components/resuseables/Buttons";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";

interface GenerateFeedbackInterface {
  feedbackFormModal: boolean;
  onClose: () => void;
  feedbackFormDetail: any;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const feedbackTypes = ["Employees to Manager", "Manager to Employees"];

const GenerateFeedbackModal = (props: GenerateFeedbackInterface) => {
  const { onClose, feedbackFormModal, feedbackFormDetail } = props;
  const dispatch = useDispatch();

  const [feedbackFormType, setFeedbackFormType] = useState("");
  const [usersList, setUsersList] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<any>({
    resolver: yupResolver(generateFeedbackSchema),
    defaultValues: feedbackFormDetail,
  });

  const handleFeedbackTypeChange = (event: SelectChangeEvent) => {
    setFeedbackFormType(event.target.value as string);
  };

  const getUsersData = async () => {
    const querySnapshot: any = await getDocs(collection(db, "users"));
    const allUsersData = querySnapshot?.docs?.reverse()?.map((doc: any) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    setUsersList(allUsersData);
  };

  useEffect(() => {
    getUsersData();
  }, []);

  const handleSubmitForm = async (data: any) => {
    console.log("data", data);

    // if (feedbackFormDetail.id) {
    //   const userId = doc(db, "feedbacks", feedbackFormDetail.id);
    //   await updateDoc(userId, data);
    //   dispatch(
    //     openAlert({
    //       type: "success",
    //       message: "Feedback updated successfully!",
    //     })
    //   );
    //   onClose();
    // } else {
    //   await setDoc(doc(db, "feedbacks", Date.now().toString(36)), data);
    //   dispatch(
    //     openAlert({
    //       type: "success",
    //       message: "Feedback added successfully!",
    //     })
    //   );
    //   onClose();
    // }
  };

  return (
    <Modal
      open={feedbackFormModal}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyles}>
        <CloseIcon onClick={onClose} sx={modalCrossStyle} />
        <Typography variant="h5" padding="10px 20px">
          {feedbackFormDetail.id ? "Update" : "Generate"} Feedback Form
        </Typography>
        <Divider />
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Box display="flex" flexDirection="column" gap="20px" padding="20px">
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Select feedback type
              </InputLabel>
              <Select
                id="demo-multiple-checkbox"
                sx={{ width: "100%", color: "var(--iconGrey)" }}
                value={feedbackFormType}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  console.log("selected", selected);

                  if (selected.length === 0) {
                    return <>Select Feedback Type</>;
                  }

                  return selected;
                }}
                MenuProps={MenuProps}
                onChange={handleFeedbackTypeChange}
              >
                {feedbackTypes.map((it: string) => (
                  <MenuItem key={it} value={it}>
                    {it}
                  </MenuItem>
                ))}
              </Select>
              {/* {validateUsers && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please select a user
                </Typography>
              )} */}
            </Box>
            <Box display="flex" justifyContent="space-between" gap="20px">
              <Box width="100%">
                <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                  Review
                </InputLabel>
                <Select
                  id="demo-multiple-checkbox"
                  sx={{ width: "100%", color: "var(--iconGrey)" }}
                  value={feedbackFormType}
                  displayEmpty
                  input={<OutlinedInput />}
                  renderValue={(selected) => {
                    console.log("selected", selected);

                    if (selected.length === 0) {
                      return <>Review</>;
                    }

                    return selected;
                  }}
                  MenuProps={MenuProps}
                  onChange={handleFeedbackTypeChange}
                >
                  {feedbackTypes.map((it: string) => (
                    <MenuItem key={it} value={it}>
                      {it}
                    </MenuItem>
                  ))}
                </Select>
                {/* {validateUsers && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please select a user
                </Typography>
              )} */}
              </Box>
              <Box width="100%">
                <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                  Reviewer
                </InputLabel>
                <Select
                  id="demo-multiple-checkbox"
                  sx={{ width: "100%", color: "var(--iconGrey)" }}
                  value={feedbackFormType}
                  displayEmpty
                  input={<OutlinedInput />}
                  renderValue={(selected) => {
                    console.log("selected", selected);

                    if (selected.length === 0) {
                      return <>Reviewer</>;
                    }

                    return selected;
                  }}
                  MenuProps={MenuProps}
                  onChange={handleFeedbackTypeChange}
                >
                  {feedbackTypes.map((it: string) => (
                    <MenuItem key={it} value={it}>
                      {it}
                    </MenuItem>
                  ))}
                </Select>
                {/* {validateUsers && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please select a user
                </Typography>
              )} */}
              </Box>
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap="20px"
            bottom="20px"
            position="absolute"
            right="20px"
          >
            <Buttons
              color="error"
              sx={{ textTransform: "capitalize" }}
              variant="contained"
              onClick={onClose}
              text="Cancel"
            />
            <Buttons
              disabled={isSubmitting}
              sx={{ textTransform: "capitalize" }}
              variant="contained"
              text={
                feedbackFormDetail.id && isSubmitting
                  ? "Updating..."
                  : feedbackFormDetail.id
                  ? "Update"
                  : isSubmitting
                  ? "Generating..."
                  : "Generate"
              }
              type="submit"
            />
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default GenerateFeedbackModal;
