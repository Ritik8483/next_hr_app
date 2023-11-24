"use client";

import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import { modalCrossStyle, modalStyles } from "@/styles/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import {
  Divider,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import InputField from "@/components/resuseables/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addFeedbacksSchema } from "@/schema/schema";
import Buttons from "@/components/resuseables/Buttons";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";

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
interface AddFeedbackModalInterface {
  openFeedbackModal: boolean;
  onClose: () => void;
  feedbackDetail: any;
}

const feedbackTypes = ["Score", "Description", "Both Score and Description"];

const AddFeedbacksModal = (props: AddFeedbackModalInterface) => {
  const dispatch = useDispatch();
  const { onClose, openFeedbackModal, feedbackDetail } = props;
  const [feedbackParameterType, setFeedbackParameterType] = useState(
    feedbackDetail?.feedback_parameter_type || ""
  );
  const [validate, setValidate] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<any>({
    resolver: yupResolver(addFeedbacksSchema),
    defaultValues: feedbackDetail,
  });

  const handleSubmitForm = async (data: any) => {
    if (!feedbackParameterType) return;
    if (feedbackDetail.id) {
      const userId = doc(db, "feedbacks", feedbackDetail.id);
      await updateDoc(userId, {
        ...data,
        feedback_parameter_type: feedbackParameterType,
      });
      dispatch(
        openAlert({
          type: "success",
          message: "Feedback updated successfully!",
        })
      );
      onClose();
    } else {
      await setDoc(doc(db, "feedbacks", Date.now().toString(36)), {
        ...data,
        feedback_parameter_type: feedbackParameterType,
      });
      dispatch(
        openAlert({
          type: "success",
          message: "Feedback added successfully!",
        })
      );
      onClose();
    }
  };

  const handleFeedbackTypeChange = (event: SelectChangeEvent) => {
    setFeedbackParameterType(event.target.value);
  };

  return (
    <Modal
      open={openFeedbackModal}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyles}>
        <CloseIcon onClick={onClose} sx={modalCrossStyle} />
        <Typography variant="h5" padding="10px 20px">
          {feedbackDetail.id ? "Update" : "Add"} Feedback
        </Typography>
        <Divider />
        <form
          style={{ overflow: "auto", height: "393px" }}
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <Box display="flex" flexDirection="column" gap="20px" padding="20px">
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Select feedback type
              </InputLabel>
              <Select
                sx={{ width: "100%", color: "var(--iconGrey)" }}
                value={feedbackParameterType}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={(selected) => {
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
              {validate && !feedbackParameterType && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please select feedback type
                </Typography>
              )}
            </Box>
            <InputField
              register={register}
              type="text"
              name="feedbackName"
              placeholder="Enter feedback name"
              label="Feedback name"
              errorMessage={errors.feedbackName?.message}
            />
            <InputField
              register={register}
              type="text"
              name="feedbackDescription"
              multiline
              rows={4}
              placeholder="Enter feedback description"
              label="Feedback description"
              errorMessage={errors.feedbackDescription?.message}
            />
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
              onClick={() => setValidate(true)}
              text={
                feedbackDetail.id && isSubmitting
                  ? "Updating..."
                  : feedbackDetail.id
                  ? "Update"
                  : isSubmitting
                  ? "Submitting..."
                  : "Submit"
              }
              type="submit"
            />
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddFeedbacksModal;
