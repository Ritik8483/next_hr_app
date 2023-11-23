"use client";

import React, { useState, useEffect, useRef } from "react";
import Modal from "@mui/material/Modal";
import { modalCrossStyle, modalStyles } from "@/styles/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import {
  Checkbox,
  Divider,
  IconButton,
  InputLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
} from "@mui/material";
import emailjs from "@emailjs/browser";
import InputField from "@/components/resuseables/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addFeedbacksSchema, generateFeedbackSchema } from "@/schema/schema";
import Buttons from "@/components/resuseables/Buttons";
import OutlinedInput from "@mui/material/OutlinedInput";
import styles from "../../pages/Login.module.css";
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
import SearchField from "@/components/resuseables/SearchField";
import useDebounce from "@/components/hooks/useDebounce";

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
const ETM = "Employees to Manager"; //employees are giving feedback to manager about his performance
const MTE = "Manager to Employees";

const GenerateFeedbackModal = (props: GenerateFeedbackInterface) => {
  const { onClose, feedbackFormModal, feedbackFormDetail } = props;
  const dispatch = useDispatch();
  const formRef: any = useRef();
  const [feedbackFormType, setFeedbackFormType] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [reviewType, setReviewType] = useState<any>("");
  const [reviewerType, setReviewerType] = useState([]);
  const [feedbackParametersArr, setFeedbackParametersArr] = useState([]);
  const [recieverInputEmails, setRecieverInputEmails] = useState("");
  const [rolesList, setRolesList] = useState([]);
  const [usersArr, setUsersArr] = useState<any>([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [searchText, setSearchText] = useState<string>("");

  const debouncedValue = useDebounce(searchText, 500);

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
    setFeedbackFormType(event.target.value);
  };

  const handleReviewChange = (item: any) => {
    setReviewType(item);
  };

  const handleFeedbackChange = (item: any) => {
    const feedbackParametersArray: any = [...feedbackParametersArr];
    const indexOfItem = feedbackParametersArray.findIndex(
      (it: any) => it.id === item.id
    );

    if (indexOfItem !== -1) {
      feedbackParametersArray.splice(indexOfItem, 1);
    } else {
      feedbackParametersArray.push(item);
    }
    setFeedbackParametersArr(feedbackParametersArray);
  };

  const handleReviewerChange = (item: any) => {
    const personNames: any = [...reviewerType];
    const indexOfItem = personNames.findIndex((it: any) => it.id === item.id);

    if (indexOfItem !== -1) {
      personNames.splice(indexOfItem, 1);
    } else {
      personNames.push(item);
    }
    setReviewerType(personNames);
    // if (personNames.length) setValidateUsers(false);
    // else setValidateUsers(true);
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

    const queryRoles: any = await getDocs(collection(db, "roles"));
    const allRolesData = queryRoles?.docs?.reverse()?.map((doc: any) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    setRolesList(allRolesData);

    const queryFeedbacks: any = await getDocs(collection(db, "feedbacks"));
    const allFeedbacksData = queryFeedbacks?.docs
      ?.reverse()
      ?.map((doc: any) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
    setFeedbacksList(allFeedbacksData);
  };

  useEffect(() => {
    getUsersData();
  }, []);

  const handleSubmitForm = async (e: any) => {
    e.preventDefault();
    console.log("formRef.current", formRef.current);

    console.log("Review", reviewType);
    console.log("Select feedback type = ", feedbackFormType);

    const feedParameters = feedbackParametersArr?.map((it: any) => it.id);
    console.log("Feedback Parameters", feedParameters);

    const reviewerUsersEmails = reviewerType?.map((it: any) => it.email);

    const reviewerTeamEmails = reviewerType?.map((it: any) => it.teamEmail);

    const allEmails = [...reviewerTeamEmails, ...reviewerUsersEmails];
    const filteredEmails = allEmails.filter((it: any) => it !== undefined);
    console.log("filteredEmils", filteredEmails.toString());
    setRecieverInputEmails(filteredEmails.toString());

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

    const resp = emailjs
      .sendForm(
        "service_45awfi4",
        "template_7qrcsmx",
        formRef.current,
        "jJk8j_-FYjBGKH0Kv"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );

    console.log("resp", resp);
    //////////////////////////////////////

    // const reviewerTeamIds = reviewerType?.map((item: any) => {
    //   const arrTeams: any =
    //     item.teamName && item?.teamUsers?.map((it: any) => it.id);
    //   return arrTeams;
    // });
    // const teamsIdsArr = reviewerTeamIds.filter(
    //   (it: string) => it !== undefined
    // );
    // const teamsArr = teamsIdsArr.flat();

    // const reviewerUsersIds = reviewerType?.map(
    //   (item: any) => item.firstName && item?.id
    // );
    // const usersArr = reviewerUsersIds.filter((it: string) => it !== undefined);

    // const allUsersArr = [...new Set([...teamsArr, ...usersArr])];
    // console.log("Reviewer", allUsersArr);

    ///////////////////////////////////////

    
  };

  const teamIds = reviewerType?.map((it: any) => it.id);
  const feedbackParametersArray = feedbackParametersArr?.map(
    (it: any) => it.id
  );

  // hari@yopmail.com,ritik.chauhan@quokkalabs.com

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

        {/* <form ref={formRef} onSubmit={handleSubmitForm}>
          <label>Name</label>
          <input type="text" name="user_name" />
          <label>Reply Email</label>
          <input type="email" name="reply_to" />
          <label>To Email</label>
          <input name="to_email" />
          <label>Message</label>
          <textarea name="message" />
          <input type="submit" value="Send" />
        </form> */}

        <form ref={formRef} onSubmit={handleSubmitForm}>
          <Box display="flex" flexDirection="column" gap="20px" padding="20px">
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Select feedback type
              </InputLabel>
              <Select
                sx={{ width: "100%", color: "var(--iconGrey)" }}
                value={feedbackFormType}
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
              {/* {validateUsers && (
      <Typography
        sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
      >
        Please select a user
      </Typography>
    )} */}
            </Box>
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Review(Shashank)
              </InputLabel>
              <Select
                disabled={!feedbackFormType}
                sx={{ width: "100%", color: "var(--iconGrey)" }}
                value={reviewType}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={(selected: any) => {
                  if (selected.length === 0 || selected === undefined) {
                    return <>Review</>;
                  }

                  return selected.firstName + " " + selected.lastName;
                }}
                // MenuProps={MenuProps}
                MenuProps={{
                  ...MenuProps,
                  autoFocus: false,
                }}
                // onChange={handleReviewChange}
              >
                <MenuItem
                  onClick={(e: any) => e.stopPropagation()}
                  autoFocus={false}
                >
                  <SearchField
                    setSearchText={setSearchText}
                    searchText={searchText}
                    placeholder="Search"
                  />
                </MenuItem>
                {usersList?.map((it: any) => (
                  <MenuItem
                    onClick={() => handleReviewChange(it)}
                    key={it.id}
                    value={it}
                  >
                    {it.firstName + " " + it.lastName}
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
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Reviewer(web-team)
              </InputLabel>
              <Select
                disabled={!feedbackFormType}
                sx={{ width: "100%", color: "var(--iconGrey)" }}
                value={reviewerType}
                multiple
                displayEmpty
                input={<OutlinedInput />}
                renderValue={(selected: any) => {
                  if (selected.length === 0) {
                    return <>Reviewer</>;
                  }
                  const teamNames = selected?.map((it: any) => it.teamName);
                  const usersNames = selected?.map(
                    (it: any) => it.firstName + " " + it.lastName
                  );
                  const finalArr = teamNames.concat(usersNames);
                  const filteredArr = finalArr.filter(
                    (it: any) => it !== "undefined undefined"
                  );
                  const filtered = filteredArr.filter(
                    (it: string) => it !== undefined
                  );

                  return filtered.join(", ");
                }}
                MenuProps={MenuProps}
                // onChange={}
              >
                <ListSubheader>Team Names</ListSubheader>
                {rolesList?.map((it: any) => {
                  return (
                    <MenuItem key={it.id} value={it}>
                      <Checkbox
                        defaultChecked={teamIds?.includes(it.id)}
                        onClick={() => handleReviewerChange(it)}
                      />
                      <ListItemText primary={it.teamName} />
                    </MenuItem>
                  );
                })}
                <ListSubheader>Employees</ListSubheader>
                {usersList?.map((it: any) => {
                  return (
                    <MenuItem key={it.id} value={it}>
                      <Checkbox
                        defaultChecked={teamIds?.includes(it.id)}
                        onClick={() => handleReviewerChange(it)}
                      />
                      <ListItemText
                        primary={it.firstName + " " + it.lastName}
                      />
                    </MenuItem>
                  );
                })}
              </Select>
              {/* {validateUsers && (
      <Typography
        sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
      >
        Please select a user
      </Typography>
    )} */}
            </Box>
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Feedback Parameters
              </InputLabel>
              <Select
                disabled={!feedbackFormType}
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
                {feedbacksList?.map((it: any) => {
                  return (
                    <MenuItem key={it.id} value={it}>
                      <Checkbox
                        defaultChecked={feedbackParametersArray?.includes(
                          it.id
                        )}
                        onClick={() => handleFeedbackChange(it)}
                      />
                      <ListItemText primary={it.feedbackName} />
                    </MenuItem>
                  );
                })}
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
          <input
            name="to_email"
            value={recieverInputEmails}
            style={{ visibility: "hidden" }}
          />
          <input
            name="message"
            value="dummy message text"
            style={{ visibility: "hidden" }}
          />
          <input
            name="user_name"
            value={reviewType.firstName + " " + reviewType.lastName}
            style={{ visibility: "hidden" }}
          />
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
              // disabled={isSubmitting}
              sx={{ textTransform: "capitalize" }}
              variant="contained"
              text="Generate"
              // text={
              //   feedbackFormDetail.id && isSubmitting
              //     ? "Updating..."
              //     : feedbackFormDetail.id
              //     ? "Update"
              //     : isSubmitting
              //     ? "Generating..."
              //     : "Generate"
              // }
              type="submit"
            />
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default GenerateFeedbackModal;
