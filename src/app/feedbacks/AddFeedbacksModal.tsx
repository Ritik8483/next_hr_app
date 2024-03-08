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
import { addFeedbacksSchema, addFeedbacksMCQSchema } from "@/schema/schema";
import Buttons from "@/components/resuseables/Buttons";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";
import {
  useAddFeedbackParameterMutation,
  useUpdateFeedbackParameterMutation,
} from "@/redux/api/api";
import {
  addFeedbackParameterCode,
  updateFeedbackParameterCode,
} from "@/constants/constant";

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

const feedbackTypes = [
  "Input",
  "Score",
  "MCQ",
  "Description",
  "Both Score and Description",
];

const AddFeedbacksModal = (props: AddFeedbackModalInterface) => {
  const dispatch = useDispatch();

  const [updateFeedbackParameter] = useUpdateFeedbackParameterMutation();
  const [addFeedbackParameter] = useAddFeedbackParameterMutation();

  const { onClose, openFeedbackModal, feedbackDetail } = props;
  const [feedbackParameterType, setFeedbackParameterType] = useState(
    feedbackDetail?.feedback_parameter_type || ""
  );
  const [validate, setValidate] = useState(false);
  const [mcqOption, setMcqOption] = useState(
    feedbackDetail?.mcqOption?.length ? feedbackDetail.mcqOption : [""]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<any>({
    resolver: yupResolver(
      feedbackParameterType === "MCQ"
        ? addFeedbacksMCQSchema
        : addFeedbacksSchema
    ),
    defaultValues: feedbackDetail,
  });

  const handleAddFields = () => {
    const values = [...mcqOption];
    values.push("");
    setMcqOption(values);
  };

  const handleRemoveFields = (index: any) => {
    const values = [...mcqOption];
    values.splice(index, 1);
    setMcqOption(values);
  };

  const handleInputChange = (index: any, event: any) => {
    const values = [...mcqOption];
    if (event.target.name === "mcqOption") {
      values[index] = event.target.value;
    }
    setMcqOption(values);
  };

  const handleSubmitForm = async (data: any) => {
    if (
      !feedbackParameterType ||
      (feedbackParameterType === "MCQ" && mcqOption.includes(""))
    )
      return;
    try {
      if (feedbackDetail._id) {
        const payload = {
          url: "feedback-parameters",
          id: feedbackDetail._id,
          body: {
            ...data,
            feedback_parameter_type: feedbackParameterType,
            mcqOption,
          },
        };

        const payloadMCQ = {
          url: "feedback-parameters",
          id: feedbackDetail._id,
          body: {
            ...data,
            feedback_parameter_type: feedbackParameterType,
            mcqOption,
          },
        };
        const resp = await updateFeedbackParameter(
          feedbackParameterType === "MCQ" ? payloadMCQ : payload
        ).unwrap();
        if (resp?.code === updateFeedbackParameterCode) {
          dispatch(
            openAlert({
              type: "success",
              message: resp.message,
            })
          );
          onClose();
        }
      } else {
        const payload = {
          url: "feedback-parameters",
          body: {
            ...data,
            feedback_parameter_type: feedbackParameterType,
          },
        };
        const payloadMCQ = {
          url: "feedback-parameters",
          body: {
            ...data,
            feedback_parameter_type: feedbackParameterType,
            mcqOption,
          },
        };
        const resp = await addFeedbackParameter(
          feedbackParameterType === "MCQ" ? payloadMCQ : payload
        ).unwrap();
        if (resp?.code === addFeedbackParameterCode) {
          dispatch(
            openAlert({
              type: "success",
              message: resp.message,
            })
          );
          onClose();
        }
      }
    } catch (error: any) {
      if (error?.status === 400) {
        dispatch(
          openAlert({
            type: "error",
            message: error?.data?.error,
          })
        );
      }
      console.log("error", error);
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
          {feedbackDetail._id ? "Update" : "Add"} Feedback
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
            {feedbackParameterType === "MCQ" && (
              <>
                {mcqOption.map((item: any, index: number) => {
                  return (
                    <>
                      <InputField
                        type="text"
                        value={item}
                        name="mcqOption"
                        onChange={(event: any) =>
                          handleInputChange(index, event)
                        }
                        placeholder="Enter MCQ option"
                        label={`Option ${index + 1}`}
                      />
                      {validate && mcqOption[index] === "" && (
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "red",
                            marginTop: "-20px",
                          }}
                        >
                          Option is required
                        </Typography>
                      )}

                      <Box
                        display={mcqOption.length <= 1 ? "none" : "flex"}
                        justifyContent="end"
                        marginRight={
                          index + 1 == mcqOption.length ? "120px" : 0
                        }
                      >
                        <Buttons
                          onClick={() => handleRemoveFields(index)}
                          color="secondary"
                          sx={{ textTransform: "capitalize" }}
                          variant="outlined"
                          text="Delete"
                        />
                      </Box>
                    </>
                  );
                })}
                <Box
                  display="flex"
                  justifyContent="end"
                  marginTop={mcqOption.length <= 1 ? 0 : "-56px"}
                >
                  <Buttons
                    disabled={mcqOption.includes("")}
                    onClick={handleAddFields}
                    color="primary"
                    sx={{ textTransform: "capitalize" }}
                    variant="outlined"
                    text="Add Option"
                  />
                </Box>
              </>
            )}
            {feedbackParameterType !== "MCQ" && (
              <InputField
                register={register}
                type="text"
                name="feedbackDescription"
                multiline
                rows={4}
                placeholder="Enter feedback description"
                label="Feedback description(optional)"
                errorMessage={errors.feedbackDescription?.message}
              />
            )}
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
                feedbackDetail._id && isSubmitting
                  ? "Updating..."
                  : feedbackDetail._id
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
