"use client";

import React from "react";
import Modal from "@mui/material/Modal";
import { modalCrossStyle, modalStyles } from "@/styles/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { Divider } from "@mui/material";
import InputField from "@/components/resuseables/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addFeedbacksSchema } from "@/schema/schema";
import Buttons from "@/components/resuseables/Buttons";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";

interface AddFeedbackModalInterface {
  openFeedbackModal: boolean;
  onClose: () => void;
  feedbackDetail: any;
}

const AddFeedbacksModal = (props: AddFeedbackModalInterface) => {
  const dispatch = useDispatch();
  const { onClose, openFeedbackModal, feedbackDetail } = props;

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
    if (feedbackDetail.id) {
      const userId = doc(db, "feedbacks", feedbackDetail.id);
      await updateDoc(userId, data);
      dispatch(
        openAlert({
          type: "success",
          message: "Feedback updated successfully!",
        })
      );
      onClose();
    } else {
      await setDoc(doc(db, "feedbacks", Date.now().toString(36)), data);
      dispatch(
        openAlert({
          type: "success",
          message: "Feedback added successfully!",
        })
      );
      onClose();
    }
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
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Box display="flex" flexDirection="column" gap="20px" padding="20px">
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
