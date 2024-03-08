import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import {
  modalCrossStyle,
  modalStyles,
  searchFieldMenuItem,
} from "@/styles/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import {
  Checkbox,
  Divider,
  InputLabel,
  ListItemText,
  ListSubheader,
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
  useAddFeedbackGroupMutation,
  useAddFeedbackParameterMutation,
  useGetAllFeedbackParametersQuery,
  useUpdateFeedbackFormGroupMutation,
  useUpdateFeedbackParameterMutation,
} from "@/redux/api/api";
import {
  addFeedbackParameterCode,
  addGroupFeedbackCode,
  updateFeedbackParameterCode,
  updateGroupFeedbackCode,
} from "@/constants/constant";
import SearchField from "@/components/resuseables/SearchField";
import useDebounce from "@/components/hooks/useDebounce";
import NoDataFound from "@/components/resuseables/NoDataFound";

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
interface GroupModalInterface {
  openFeedbackGroupModal: boolean;
  onClose: () => void;
  feedbackGroupDetail: any;
}

const GroupFeedbackModal = (props: GroupModalInterface) => {
  const dispatch = useDispatch();
  const { openFeedbackGroupModal, onClose, feedbackGroupDetail } = props;
  const [feedbackGroupName, setFeedbackGroupName] = useState(
    feedbackGroupDetail?.feedbackGroupName || ""
  );
  const [validate, setValidate] = useState<boolean>(false);
  const [feedbackParametersArr, setFeedbackParametersArr] = useState(
    (feedbackGroupDetail?.groupFeedbacks?.length &&
      feedbackGroupDetail?.groupFeedbacks) ||
      []
  );
  const [searchFeedbacks, setSearchFeedbacks] = useState<string>("");
  const debouncedFeedbacks = useDebounce(searchFeedbacks, 500);

  const feedbacksPayload = {
    url: "feedback-parameters",
    search: debouncedFeedbacks,
  };
  const { data } = useGetAllFeedbackParametersQuery(feedbacksPayload);
  const [addFeedbackGroup, { isLoading }] = useAddFeedbackGroupMutation();
  const [updateFeedbackFormGroup, { isLoading: updateGroupIsLoading }] =
    useUpdateFeedbackFormGroupMutation();

  const handleOnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") {
      e.stopPropagation();
    }
  };

  const handleFeedbackChange = (item: any) => {
    const feedbackParametersArray: any = [...feedbackParametersArr];
    const indexOfItem = feedbackParametersArray.findIndex(
      (it: any) => it._id === item._id
    );

    if (indexOfItem !== -1) {
      feedbackParametersArray.splice(indexOfItem, 1);
    } else {
      feedbackParametersArray.push(item);
    }
    setFeedbackParametersArr(feedbackParametersArray);
  };

  const feedbackParametersArray = feedbackParametersArr?.map(
    (it: any) => it._id
  );

  const handleSubmitForm = async (e: any) => {
    e.preventDefault();
    if (!feedbackGroupName || !feedbackParametersArr.length) {
      return;
    }
    console.log("data", { feedbackGroupName });
    console.log(feedbackParametersArr.map((it: any) => it._id));
    try {
      if (feedbackGroupDetail?._id) {
        const payload = {
          id: feedbackGroupDetail?._id,
          url: "group-parameters",
          body: {
            feedbackGroupName,
            groupFeedbacks: feedbackParametersArr.map((it: any) => it._id),
          }, 
        };
        const resp = await updateFeedbackFormGroup(payload).unwrap();
        console.log("resp", resp);
        if (resp?.code === updateGroupFeedbackCode) {
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
          url: "group-parameters",
          body: {
            feedbackGroupName,
            groupFeedbacks: feedbackParametersArr.map((it: any) => it._id),
          },
        };
        const resp = await addFeedbackGroup(payload).unwrap();
        console.log("resp", resp);
        if (resp?.code === addGroupFeedbackCode) {
          dispatch(
            openAlert({
              type: "success",
              message: resp.message,
            })
          );
          onClose();
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <Modal
      open={openFeedbackGroupModal}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyles}>
        <CloseIcon onClick={onClose} sx={modalCrossStyle} />
        <Typography variant="h5" padding="10px 20px">
          {feedbackGroupDetail._id ? "Update" : "Add"} Group name
        </Typography>
        <Divider />
        <form onSubmit={handleSubmitForm}>
          <Box display="flex" flexDirection="column" gap="20px" padding="20px">
            <Box>
              <InputField
                type="text"
                value={feedbackGroupName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFeedbackGroupName(e.target.value)
                }
                placeholder="Enter feedback group name"
                label="Feedback group name"
              />
              {validate && !feedbackGroupName && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please enter feedback group name
                </Typography>
              )}
            </Box>
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Feedback Parameters
              </InputLabel>
              <Select
                sx={{ width: "100%", color: "var(--iconGrey)" }}
                value={feedbackParametersArr}
                displayEmpty
                multiple
                input={<OutlinedInput />}
                renderValue={(selected: any) => {
                  if (selected.length === 0 || selected === undefined) {
                    return <>Selects Feedback Parameters</>;
                  }
                  const feedbackNames = selected?.map(
                    (it: any) => it.feedbackName
                  );

                  return feedbackNames.join(", ");
                }}
                MenuProps={{
                  ...MenuProps,
                  autoFocus: false,
                }}
              >
                <ListSubheader sx={{ width: "100%", padding: "0" }}>
                  <MenuItem
                    sx={searchFieldMenuItem}
                    onClick={(e: any) => e.stopPropagation()}
                  >
                    <SearchField
                      setSearchText={setSearchFeedbacks}
                      searchText={searchFeedbacks}
                      placeholder="Search"
                      onKeyDown={(e: React.KeyboardEvent) => handleOnKeyDown(e)}
                    />
                  </MenuItem>
                </ListSubheader>
                {data?.data?.length ? (
                  data?.data?.map((it: any) => {
                    return (
                      <MenuItem
                        key={it._id}
                        value={it}
                        onClick={() => handleFeedbackChange(it)}
                      >
                        <Checkbox
                          defaultChecked={feedbackParametersArray?.includes(
                            it._id
                          )}
                          checked={feedbackParametersArray?.includes(it._id)}
                        />
                        <ListItemText
                          sx={{ textWrap: "balance" }}
                          primary={
                            it.feedbackName +
                            " " +
                            "(" +
                            it.feedback_parameter_type +
                            ")"
                          }
                        />
                      </MenuItem>
                    );
                  })
                ) : (
                  <NoDataFound height="auto" text="No data Found" />
                )}
              </Select>
              {validate && !feedbackParametersArr.length && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please select the feedback parameters
                </Typography>
              )}
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
              disabled={isLoading || updateGroupIsLoading}
              sx={{ textTransform: "capitalize" }}
              variant="contained"
              onClick={() => setValidate(true)}
              text={
                feedbackGroupDetail?._id && (isLoading || updateGroupIsLoading)
                  ? "Updating..."
                  : feedbackGroupDetail?._id
                  ? "Update"
                  : isLoading
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

export default GroupFeedbackModal;
