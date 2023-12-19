"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import Buttons from "@/components/resuseables/Buttons";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";
import SearchField from "@/components/resuseables/SearchField";
import useDebounce from "@/components/hooks/useDebounce";
import NoDataFound from "@/components/resuseables/NoDataFound";
import { ETM, MTE } from "@/constants/constant";

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

  const [feedbackFormType, setFeedbackFormType] = useState(
    feedbackFormDetail?.feedback_type || ""
  );
  const [usersList, setUsersList] = useState([]);
  const [reviewerType, setReviewerType] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackParametersArr, setFeedbackParametersArr] = useState([]);
  const [validate, setValidate] = useState(false);
  const [rolesList, setRolesList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [searchReviewText, setSearchReviewText] = useState<string>("");
  const [searchReviewerText, setSearchReviewerText] = useState<string>("");
  const [reviewType, setReviewType] = useState<any>(
    feedbackFormDetail?.review || ""
  );
  const [multipleReviewType, setMultipleReviewType] = useState<any>([]);
  const [searchFeedbacks, setSearchFeedbacks] = useState<string>("");
  const debouncedReview = useDebounce(searchReviewText, 500);
  const debouncedReviewer = useDebounce(searchReviewerText, 500);
  const debouncedFeedbacks = useDebounce(searchFeedbacks, 500);

  const handleFeedbackTypeChange = (event: SelectChangeEvent) => {
    setFeedbackFormType(event.target.value);
    setMultipleReviewType([]);
    setReviewType("");
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
  };

  const handleMultiReviewChange = (item: any) => {
    const personNames: any = [...multipleReviewType];

    const indexOfItem = personNames.findIndex((it: any) => it.id === item.id);
    if (indexOfItem !== -1) {
      personNames.splice(indexOfItem, 1);
    } else {
      personNames.push(item);
    }
    setMultipleReviewType(personNames);
  };

  const getUsersData = async () => {
    let reviewerArrOfUsers: any = [];
    let multipleReviewArr: any = [];
    const filteredReviews: any =
      feedbackFormDetail?.feedback_type === MTE &&
      feedbackFormDetail?.review?.map((it: any) => it.email || it.teamEmail);

    try {
      if (debouncedReview.length > 0 || debouncedReviewer.length > 0) {
        const usersRef = collection(db, "users");
        const querySearch = query(
          usersRef,
          or(where("firstName", "==", debouncedReviewer || debouncedReview))
        );

        const querySnapshot = await getDocs(querySearch);

        const usersArr: any = querySnapshot?.docs?.map((doc: any) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setUsersList(usersArr);
      } else {
        const querySnapshot: any = await getDocs(collection(db, "users"));
        const allUsersData = querySnapshot?.docs?.reverse()?.map((doc: any) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        const resp = allUsersData?.filter((item: any) =>
          feedbackFormDetail?.reviewerEmails?.split(",")?.includes(item.email)
        );

        if (feedbackFormDetail?.id && !reviewerType.length) {
          reviewerArrOfUsers = resp;
          setReviewerType([...resp]);
        }
        if (
          feedbackFormDetail?.id &&
          feedbackFormDetail?.feedback_type === MTE &&
          !multipleReviewType.length
        ) {
          const response = allUsersData?.filter((item: any) =>
            filteredReviews?.includes(item.email)
          );

          multipleReviewArr = response;
          setMultipleReviewType([...response]);
        }
        setUsersList(allUsersData);
      }

      if (
        (feedbackFormType === MTE && debouncedReview.length > 0) ||
        debouncedReviewer.length > 0
      ) {
        const usersRef = collection(db, "roles");
        const querySearch = query(
          usersRef,
          or(where("teamName", "==", debouncedReview || debouncedReviewer))
        );
        const querySnapshot = await getDocs(querySearch);
        const allRolesData: any = querySnapshot?.docs?.map((doc: any) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setRolesList(allRolesData);
      } else {
        const queryRoles: any = await getDocs(collection(db, "roles"));
        const allRolesData = queryRoles?.docs?.reverse()?.map((doc: any) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });

        const response = allRolesData?.filter((item: any) =>
          feedbackFormDetail?.reviewerEmails
            ?.split(",")
            ?.includes(item.teamEmail)
        );

        if (feedbackFormDetail?.id && !reviewerType.length) {
          setReviewerType([...reviewerArrOfUsers, ...response]);
          reviewerArrOfUsers = [];
        }

        if (
          feedbackFormDetail?.id &&
          feedbackFormDetail?.feedback_type === MTE &&
          !multipleReviewType.length
        ) {
          const responseReviews = allRolesData?.filter((item: any) =>
            filteredReviews?.includes(item.teamEmail)
          );

          setMultipleReviewType([...multipleReviewArr, ...responseReviews]);
          multipleReviewArr = [];
        }
        setRolesList(allRolesData);
      }

      if (debouncedFeedbacks.length > 0) {
        const usersRef = collection(db, "feedbacks");
        const querySearch = query(
          usersRef,
          or(where("feedbackName", "==", debouncedFeedbacks))
        );
        const querySnapshot = await getDocs(querySearch);
        const feedbacksArr: any = querySnapshot?.docs?.map((doc: any) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setFeedbacksList(feedbacksArr);
      } else {
        const queryFeedbacks: any = await getDocs(collection(db, "feedbacks"));
        const allFeedbacksData = queryFeedbacks?.docs
          ?.reverse()
          ?.map((doc: any) => {
            return {
              id: doc.id,
              ...doc.data(),
            };
          });
        const resp = allFeedbacksData?.filter((item: any) =>
          feedbackFormDetail?.feedback_parameters?.includes(item.id)
        );
        if (feedbackFormDetail?.id && !feedbackParametersArr.length) {
          setFeedbackParametersArr(resp);
        }
        setFeedbacksList(allFeedbacksData);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getUsersData();
  }, [debouncedReview, debouncedReviewer, debouncedFeedbacks]);

  const handleSubmitForm = async (e: any) => {
    e.preventDefault();
    if (
      (feedbackFormType === ETM && reviewType === "") ||
      (feedbackFormType === MTE && !multipleReviewType.length) ||
      feedbackFormType === "" ||
      !feedbackParametersArr.length ||
      !reviewerType.length
    )
      return;
    setIsSubmitting(true);

    const feedParameters = feedbackParametersArr?.map((it: any) => it.id);

    //Extracting Emails of the Reviewer
    const reviewerUsersEmails = reviewerType?.map((it: any) => it.email);
    const reviewerTeamEmails = reviewerType?.map((it: any) => it.teamEmail);
    const allEmails = [...reviewerTeamEmails, ...reviewerUsersEmails];
    const filteredEmails = allEmails.filter((it: any) => it !== undefined);

    //Extracting user ids of Reviewer
    const reviewerTeamIds = reviewerType?.map((item: any) => {
      const arrTeams: any =
        item.teamName && item?.teamUsers?.map((it: any) => it.id);
      return arrTeams;
    });
    const teamsIdsArr = reviewerTeamIds.filter(
      (it: string) => it !== undefined
    );
    const teamsArr = teamsIdsArr.flat();

    const reviewerUsersIds = reviewerType?.map(
      (item: any) => item.firstName && item?.id
    );
    const usersArr = reviewerUsersIds.filter((it: string) => it !== undefined);

    const allUsersArr = [...new Set([...teamsArr, ...usersArr])];

    const feedbackFormData = {
      feedback_type: feedbackFormType,
      review: feedbackFormType === ETM ? reviewType : multipleReviewType,
      reviewer: allUsersArr,
      feedback_parameters: feedParameters,
      reviewerEmails: filteredEmails.toString(),
    };

    try {
      if (feedbackFormDetail.id) {
        const userId = doc(db, "feedback_form", feedbackFormDetail.id);
        await updateDoc(userId, feedbackFormData);
        dispatch(
          openAlert({
            type: "success",
            message: "Feedback form updated successfully!",
          })
        );
        onClose();
      } else {
        await setDoc(
          doc(db, "feedback_form", Date.now().toString(36)),
          feedbackFormData
        );

        dispatch(
          openAlert({
            type: "success",
            message: "Feedback form created successfully!",
          })
        );
        onClose();
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const teamIds = reviewerType?.map((it: any) => it.id);
  const feedbackParametersArray = feedbackParametersArr?.map(
    (it: any) => it.id
  );
  const reviewTeamIds = multipleReviewType?.map((it: any) => it.id);

  const handleSubmitClick = () => {
    if (
      (feedbackFormType === ETM && reviewType === "") ||
      (feedbackFormType === MTE && !multipleReviewType.length) ||
      feedbackFormType === "" ||
      !feedbackParametersArr.length ||
      !reviewerType.length
    )
      setValidate(true);
    else setValidate(false);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") {
      e.stopPropagation();
    }
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
          {feedbackFormDetail.id ? "Update" : "Create"} Feedback Form
        </Typography>
        <Divider />

        <form
          style={{ overflow: "auto", height: "393px" }}
          onSubmit={handleSubmitForm}
        >
          <Box display="flex" flexDirection="column" gap="20px" padding="20px">
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Select feedback for
              </InputLabel>
              <Select
                sx={{ width: "100%", color: "var(--iconGrey)" }}
                value={feedbackFormType}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <>Select feedback for</>;
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
              {validate && !feedbackFormType && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please select feedback for
                </Typography>
              )}
            </Box>
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Review(Shashank)
              </InputLabel>
              <Select
                disabled={!feedbackFormType}
                sx={{ width: "100%", color: "var(--iconGrey)" }}
                value={
                  feedbackFormType === MTE ? multipleReviewType : reviewType
                }
                onClose={() => setSearchReviewText("")}
                onOpen={() => setSearchReviewText("")}
                displayEmpty
                multiple={feedbackFormType === MTE ? true : false}
                input={<OutlinedInput />}
                renderValue={(selected: any) => {
                  if (selected.length === 0 || selected === undefined) {
                    return <>Review</>;
                  }
                  if (feedbackFormType === MTE) {
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
                  } else {
                    return (
                      selected.firstName +
                      " " +
                      selected.lastName +
                      " " +
                      "(" +
                      selected.designation +
                      ")"
                    );
                  }
                }}
                MenuProps={{
                  autoFocus: false,
                  ...MenuProps,
                }}
              >
                <ListSubheader sx={{ width: "100%", padding: "0" }}>
                  <MenuItem
                    sx={searchFieldMenuItem}
                    onClick={(e: any) => e.stopPropagation()}
                  >
                    <SearchField
                      setSearchText={setSearchReviewText}
                      searchText={searchReviewText}
                      placeholder="Search"
                      onKeyDown={(e: React.KeyboardEvent) => handleOnKeyDown(e)}
                    />
                  </MenuItem>
                </ListSubheader>
                {feedbackFormType === ETM &&
                  (usersList?.length ? (
                    usersList?.map((it: any) => (
                      <MenuItem
                        onClick={() => handleReviewChange(it)}
                        key={it.id}
                        value={it}
                      >
                        {it.firstName +
                          " " +
                          it.lastName +
                          " " +
                          "(" +
                          it.designation +
                          ")"}
                      </MenuItem>
                    ))
                  ) : (
                    <NoDataFound height="auto" text="No data Found" />
                  ))}

                {feedbackFormType === MTE && (
                  <>
                    <ListSubheader>Team Names</ListSubheader>
                    {rolesList?.length ? (
                      rolesList?.map((it: any) => {
                        return (
                          <MenuItem
                            key={it.id}
                            value={it}
                            onClick={() => handleMultiReviewChange(it)}
                          >
                            <Checkbox
                              defaultChecked={reviewTeamIds?.includes(it.id)}
                              checked={reviewTeamIds?.includes(it.id)}
                            />
                            <ListItemText primary={it.teamName} />
                          </MenuItem>
                        );
                      })
                    ) : (
                      <NoDataFound height="auto" text="No data Found" />
                    )}
                    <ListSubheader>Employees</ListSubheader>
                    {usersList.length ? (
                      usersList?.map((it: any) => {
                        return (
                          <MenuItem
                            key={it.id}
                            value={it}
                            onClick={() => handleMultiReviewChange(it)}
                          >
                            <Checkbox
                              defaultChecked={reviewTeamIds?.includes(it.id)}
                              checked={reviewTeamIds?.includes(it.id)}
                            />
                            <ListItemText
                              primary={it.firstName + " " + it.lastName}
                            />
                          </MenuItem>
                        );
                      })
                    ) : (
                      <NoDataFound height="auto" text="No data Found" />
                    )}
                  </>
                )}
              </Select>
              {validate &&
                (feedbackFormType === MTE
                  ? !multipleReviewType?.length
                  : !reviewType) && (
                  <Typography
                    sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                  >
                    Please select a person to review
                  </Typography>
                )}
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
                onClose={() => {
                  setSearchReviewText("");
                  setSearchReviewerText("");
                }}
                onOpen={() => {
                  setSearchReviewText("");
                  setSearchReviewerText("");
                }}
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
                MenuProps={{
                  autoFocus: false,
                  ...MenuProps,
                }}
              >
                <ListSubheader sx={{ width: "100%", padding: "0" }}>
                  <MenuItem
                    sx={searchFieldMenuItem}
                    onClick={(e: any) => e.stopPropagation()}
                  >
                    <SearchField
                      setSearchText={setSearchReviewerText}
                      searchText={searchReviewerText}
                      placeholder="Search"
                      onKeyDown={(e: React.KeyboardEvent) => handleOnKeyDown(e)}
                    />
                  </MenuItem>
                </ListSubheader>
                <ListSubheader>Team Names</ListSubheader>
                {rolesList?.length ? (
                  rolesList?.map((it: any) => {
                    return (
                      <MenuItem
                        key={it.id}
                        value={it}
                        onClick={() => handleReviewerChange(it)}
                      >
                        <Checkbox
                          defaultChecked={teamIds?.includes(it.id)}
                          checked={teamIds?.includes(it.id)}
                        />
                        <ListItemText primary={it.teamName} />
                      </MenuItem>
                    );
                  })
                ) : (
                  <NoDataFound height="auto" text="No data Found" />
                )}
                <ListSubheader>Employees</ListSubheader>
                {usersList.length ? (
                  usersList?.map((it: any) => {
                    return (
                      <MenuItem
                        key={it.id}
                        value={it}
                        onClick={() => handleReviewerChange(it)}
                      >
                        <Checkbox
                          defaultChecked={teamIds?.includes(it.id)}
                          checked={teamIds?.includes(it.id)}
                        />
                        <ListItemText
                          primary={it.firstName + " " + it.lastName}
                        />
                      </MenuItem>
                    );
                  })
                ) : (
                  <NoDataFound height="auto" text="No data Found" />
                )}
              </Select>
              {validate && !reviewerType.length && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please select the reviewer
                </Typography>
              )}
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
                onClose={() => setSearchFeedbacks("")}
                onOpen={() => setSearchFeedbacks("")}
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
                {feedbacksList?.length ? (
                  feedbacksList?.map((it: any) => {
                    return (
                      <MenuItem
                        key={it.id}
                        value={it}
                        onClick={() => handleFeedbackChange(it)}
                      >
                        <Checkbox
                          defaultChecked={feedbackParametersArray?.includes(
                            it.id
                          )}
                          checked={feedbackParametersArray?.includes(it.id)}
                        />
                        <ListItemText
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
              disabled={isSubmitting}
              sx={{ textTransform: "capitalize" }}
              variant="contained"
              onClick={handleSubmitClick}
              text={
                feedbackFormDetail.id && isSubmitting
                  ? "Updating..."
                  : feedbackFormDetail.id
                  ? "Update"
                  : isSubmitting
                  ? "Creating..."
                  : "Create"
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

// ETM same Flow_Block
// MTE review teams/employee and employer shashank
