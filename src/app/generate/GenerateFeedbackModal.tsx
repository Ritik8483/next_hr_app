"use client";

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
  FormControlLabel,
  InputLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
} from "@mui/material";
import Buttons from "@/components/resuseables/Buttons";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";
import SearchField from "@/components/resuseables/SearchField";
import useDebounce from "@/components/hooks/useDebounce";
import NoDataFound from "@/components/resuseables/NoDataFound";
import {
  ETM,
  MTE,
  SA,
  addFeedbackFormCode,
  updateFeedbackFormCode,
} from "@/constants/constant";
import {
  useAddGenerateFeedbackFormMutation,
  useGetAllFeedbackGroupsQuery,
  useGetAllFeedbackParametersQuery,
  useGetAllRolesQuery,
  useGetAllUsersQuery,
  useUpdateFeedbackFormMutation,
} from "@/redux/api/api";
import InputField from "@/components/resuseables/InputField";

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

const feedbackTypes = [
  "Employees to Manager",
  "Manager to Employees",
  "Self Assessment",
];

const GenerateFeedbackModal = (props: GenerateFeedbackInterface) => {
  const { onClose, feedbackFormModal, feedbackFormDetail } = props;
  const dispatch = useDispatch();

  const [feedbackFormType, setFeedbackFormType] = useState(
    feedbackFormDetail?.feedback_type || ""
  );
  const [reviewerType, setReviewerType] = useState<any>(
    (feedbackFormDetail?.reviewer?.length && feedbackFormDetail?.reviewer) || []
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackName, setFeedbackName] = useState(
    feedbackFormDetail?.feedbackName || ""
  );
  const [feedbackParametersArr, setFeedbackParametersArr] = useState(
    (feedbackFormDetail?.feedback_parameters?.length &&
      feedbackFormDetail?.feedback_parameters) ||
      []
  );
  const [validate, setValidate] = useState(false);
  const [anonymous, setAnonymous] = useState(
    feedbackFormDetail?.anonymous || false
  );
  const [searchReviewText, setSearchReviewText] = useState<string>("");
  const [feedbackIds, setFeedbackIds] = useState<any>([]);
  const [searchReviewerText, setSearchReviewerText] = useState<string>("");
  const [reviewType, setReviewType] = useState<any>(
    (feedbackFormDetail?.review && feedbackFormDetail?.review[0]) || ""
  );
  const [multipleReviewType, setMultipleReviewType] = useState<any>(
    (feedbackFormDetail?.review?.length && feedbackFormDetail?.review) || []
  );
  const [searchFeedbacks, setSearchFeedbacks] = useState<string>("");
  const debouncedReview = useDebounce(searchReviewText, 500);
  const debouncedReviewer = useDebounce(searchReviewerText, 500);
  const debouncedFeedbacks = useDebounce(searchFeedbacks, 500);

  const [addGenerateFeedbackForm] = useAddGenerateFeedbackFormMutation();
  const [updateFeedbackForm] = useUpdateFeedbackFormMutation();

  const usersPayload = {
    url: "users",
    search: debouncedReviewer || debouncedReview,
  };

  const rolesPayload = {
    url: "roles",
    search: debouncedReviewer,
  };

  const payloadFeedback = {
    url: "group-parameters",
    // search: ,
  };

  const feedbacksPayload = {
    url: "feedback-parameters",
    search: debouncedFeedbacks,
  };
  const { data: usersData } = useGetAllUsersQuery(usersPayload);
  const { data: feedbackParametersData } =
    useGetAllFeedbackParametersQuery(feedbacksPayload);
  const { data: rolesData } = useGetAllRolesQuery(rolesPayload);
  const { data: feedbackGroupsData } =
    useGetAllFeedbackGroupsQuery(payloadFeedback);

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
      (it: any) => it._id === item._id
    );

    if (indexOfItem !== -1) {
      feedbackParametersArray.splice(indexOfItem, 1);
    } else {
      feedbackParametersArray.push(item);
    }
    setFeedbackParametersArr(feedbackParametersArray);
    if (Object.keys(item).includes("feedbackGroupName")) {
      const feedParameters = feedbackParametersArray
        ?.map((it: any) => {
          if (Object.keys(it).includes("feedbackGroupName")) {
            return it;
          } else return null;
        })
        .filter((item: any) => item !== null)
        .map((items: any) => items.groupFeedbacks)
        .flat()
        .map((ite: any) => ite._id);
      const allDirectParameters = feedbackParametersArray
        .map((it: any) => {
          if (Object.keys(it).includes("feedbackName")) {
            return it._id;
          } else return null;
        })
        .filter((item: any) => item !== null);
      const filteredParameters = [
        ...new Set([...allDirectParameters, ...feedParameters]),
      ];
      setFeedbackIds(filteredParameters);
    }
  };

  const handleReviewerChange = (item: any) => {
    const personNames: any = [...reviewerType];
    const indexOfItem = personNames.findIndex((it: any) => it._id === item._id);

    if (indexOfItem !== -1) {
      personNames.splice(indexOfItem, 1);
    } else {
      personNames.push(item);
    }
    setReviewerType(personNames);
  };

  const handleMultiReviewChange = (item: any) => {
    const personNames: any = [...multipleReviewType];

    const indexOfItem = personNames.findIndex((it: any) => it._id === item._id);
    if (indexOfItem !== -1) {
      personNames.splice(indexOfItem, 1);
    } else {
      personNames.push(item);
    }
    setMultipleReviewType(personNames);
  };

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

    //extracting feedback parameters id
    const feedParameters = feedbackParametersArr
      ?.map((it: any) => {
        if (Object.keys(it).includes("feedbackGroupName")) {
          return it;
        } else return null;
      })
      .filter((item: any) => item !== null)
      .map((items: any) => items.groupFeedbacks)
      .flat()
      .map((ite: any) => ite._id);
    const allDirectParameters = feedbackParametersArr
      .map((it: any) => {
        if (Object.keys(it).includes("feedbackName")) {
          return it._id;
        } else return null;
      })
      .filter((item: any) => item !== null);
    const filteredParameters = [
      ...new Set([...allDirectParameters, ...feedParameters]),
    ];

    //Extracting Emails of the Reviewer
    const reviewerUsersEmails = reviewerType?.map((it: any) => it.email);
    const reviewerTeamEmails = reviewerType?.map((it: any) => it.teamEmail);
    const userEmails = rolesData?.data?.filter((it: any) =>
      reviewerTeamEmails.includes(it.teamEmail)
    );
    const extractTeamUsers = userEmails?.map((it: any) => it?.teamUsers);
    const extractTeamEmails = extractTeamUsers
      ?.flat()
      ?.map((it: any) => it?.email);
    const allEmails = [...reviewerUsersEmails, ...extractTeamEmails];
    const uniqueEmails = [...new Set(allEmails)];
    const filteredEmails = uniqueEmails.filter((it: any) => it !== undefined);

    //Extracting Reviews for MTE
    const filterUserIds =
      feedbackFormType === MTE &&
      multipleReviewType?.map((it: any) => {
        if (Object.keys(it).some((key) => key.includes("team"))) {
          return it.teamUsers.map((item: any) => item._id);
        } else if (Object.keys(it).some((key) => key.includes("firstName"))) {
          return it._id;
        }
      });
    const flattenedIdsArray = feedbackFormType === MTE && [
      ...new Set(filterUserIds.flat()),
    ];

    //Extracting user ids of Reviewer
    const reviewerTeamIds = reviewerType?.map((item: any) => {
      const arrTeams: any =
        item.teamName && item?.teamUsers?.map((it: any) => it._id);
      return arrTeams;
    });
    const teamsIdsArr = reviewerTeamIds.filter(
      (it: string) => it !== undefined
    );
    const teamsArr = teamsIdsArr.flat();

    const reviewerUsersIds = reviewerType?.map(
      (item: any) => item.firstName && item?._id
    );
    const usersArr = reviewerUsersIds.filter((it: string) => it !== undefined);

    const allUsersArr = [...new Set([...teamsArr, ...usersArr])];

    const feedbackFormData = {
      feedbackName: feedbackName,
      feedback_type: feedbackFormType,
      review:
        feedbackFormType === SA
          ? undefined
          : feedbackFormType === ETM
          ? [reviewType]
          : flattenedIdsArray,
      reviewer: allUsersArr,
      feedback_parameters: filteredParameters,
      reviewerEmails: filteredEmails.toString(),
      anonymous: feedbackFormType === ETM ? anonymous : undefined,
    };

    try {
      if (feedbackFormDetail._id) {
        const payload = {
          url: "feedback-form",
          id: feedbackFormDetail._id,
          body: feedbackFormData,
        };

        const resp = await updateFeedbackForm(payload).unwrap();
        if (resp?.code === updateFeedbackFormCode) {
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
          url: "feedback-form",
          body: feedbackFormData,
        };
        const resp = await addGenerateFeedbackForm(payload).unwrap();
        if (resp?.code === addFeedbackFormCode) {
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

  const teamIds = reviewerType?.map((it: any) => it._id);
  const feedbackParametersArray = feedbackParametersArr?.map(
    (it: any) => it._id
  );
  const reviewTeamIds = multipleReviewType?.map((it: any) => it._id);

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

  const feedbackParaIds = feedbackFormDetail?.feedback_parameters?.map(
    (it: any) => it._id
  );

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
          {feedbackFormDetail._id ? "Update" : "Create"} Feedback Form
        </Typography>
        <Divider />

        <form
          style={{ overflow: "auto", height: "393px" }}
          onSubmit={handleSubmitForm}
        >
          <Box display="flex" flexDirection="column" gap="20px" padding="20px">
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Feedback Name
              </InputLabel>
              <InputField
                type="text"
                id="feedbackName"
                value={feedbackName}
                onChange={(e: any) => setFeedbackName(e.target.value)}
                name="feedbackName" //name is essentially required
                placeholder="Feedback form name"
              />
              {validate && !feedbackName && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please provide feedback form name
                </Typography>
              )}
            </Box>
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
                    return <>Select feedback type</>;
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
                  Please select feedback type
                </Typography>
              )}
            </Box>
            {feedbackFormType !== SA && (
              <Box>
                <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                  Review
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
                        onKeyDown={(e: React.KeyboardEvent) =>
                          handleOnKeyDown(e)
                        }
                      />
                    </MenuItem>
                  </ListSubheader>
                  {feedbackFormType === ETM &&
                    (usersData?.data?.length ? (
                      usersData?.data?.map((it: any) => (
                        <MenuItem
                          onClick={() => handleReviewChange(it)}
                          key={it._id}
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
                      {rolesData?.data?.length ? (
                        rolesData?.data?.map((it: any) => {
                          return (
                            <MenuItem
                              key={it._id}
                              value={it}
                              onClick={() => handleMultiReviewChange(it)}
                            >
                              <Checkbox
                                defaultChecked={reviewTeamIds?.includes(it._id)}
                                checked={reviewTeamIds?.includes(it._id)}
                              />
                              <ListItemText primary={it.teamName} />
                            </MenuItem>
                          );
                        })
                      ) : (
                        <NoDataFound height="auto" text="No data Found" />
                      )}
                      <ListSubheader>Employees</ListSubheader>
                      {usersData?.data?.length ? (
                        usersData?.data?.map((it: any) => {
                          return (
                            <MenuItem
                              key={it._id}
                              value={it}
                              onClick={() => handleMultiReviewChange(it)}
                            >
                              <Checkbox
                                defaultChecked={reviewTeamIds?.includes(it._id)}
                                checked={reviewTeamIds?.includes(it._id)}
                              />
                              <ListItemText
                                primary={
                                  it.firstName +
                                  " " +
                                  it.lastName +
                                  " " +
                                  "(" +
                                  it.designation +
                                  ")"
                                }
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
            )}
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Reviewer
              </InputLabel>
              <Select
                disabled={
                  !feedbackFormType ||
                  (feedbackFormType === ETM && !reviewType) ||
                  (feedbackFormType === MTE && !multipleReviewType.length)
                }
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
                {feedbackFormType === ETM && (
                  <>
                    <ListSubheader>Team Names</ListSubheader>
                    {rolesData?.data?.length ? (
                      rolesData?.data?.map((it: any) => {
                        return (
                          <MenuItem
                            key={it._id}
                            value={it}
                            disabled={
                              multipleReviewType
                                ?.map((item: any) => item?._id)
                                .includes(it._id) || reviewType?._id === it._id
                            }
                            onClick={() => handleReviewerChange(it)}
                          >
                            <Checkbox
                              defaultChecked={teamIds?.includes(it._id)}
                              checked={teamIds?.includes(it._id)}
                            />
                            <ListItemText primary={it.teamName} />
                          </MenuItem>
                        );
                      })
                    ) : (
                      <NoDataFound height="auto" text="No data Found" />
                    )}
                  </>
                )}
                <ListSubheader>Employees</ListSubheader>
                {usersData?.data.length ? (
                  usersData?.data?.map((it: any) => {
                    return (
                      <MenuItem
                        key={it._id}
                        disabled={
                          multipleReviewType
                            ?.map((item: any) => item?._id)
                            .includes(it._id) || reviewType?._id === it._id
                        }
                        value={it}
                        onClick={() => handleReviewerChange(it)}
                      >
                        <Checkbox
                          defaultChecked={teamIds?.includes(it._id)}
                          checked={teamIds?.includes(it._id)}
                        />
                        <ListItemText
                          primary={
                            it.firstName +
                            " " +
                            it.lastName +
                            " " +
                            "(" +
                            it.designation +
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
                disabled={
                  !feedbackFormType ||
                  (feedbackFormType === ETM && !reviewType) ||
                  (feedbackFormType === MTE && !multipleReviewType.length)
                }
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
                  const feedbackNames = selected?.map((it: any) => {
                    if (Object.keys(it).includes("feedbackName")) {
                      return it.feedbackName;
                    } else {
                      return it.feedbackGroupName;
                    }
                  });

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

                <ListSubheader>Feedback Groups</ListSubheader>
                {feedbackGroupsData?.data?.length ? (
                  feedbackGroupsData?.data?.map((it: any) => {
                    const feedIds = it?.groupFeedbacks?.map(
                      (item: any) => item._id
                    );

                    return (
                      <MenuItem
                        key={it._id}
                        value={it}
                        onClick={() => handleFeedbackChange(it)}
                      >
                        <Checkbox
                          defaultChecked={feedIds?.every((ite: any) =>
                            feedbackParaIds?.includes(ite)
                          )}
                          checked={feedIds?.every((ite: any) =>
                            feedbackParaIds?.includes(ite)
                          )}
                        />
                        <ListItemText primary={it.feedbackGroupName} />
                      </MenuItem>
                    );
                  })
                ) : (
                  <NoDataFound height="auto" text="No data Found" />
                )}

                <ListSubheader>Feedback Parameters</ListSubheader>
                {feedbackParametersData?.data?.length ? (
                  feedbackParametersData?.data?.map((it: any) => {
                    return (
                      <MenuItem
                        key={it._id}
                        disabled={feedbackIds.includes(it._id)}
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
            {feedbackFormType === ETM && (
              <FormControlLabel
                control={
                  <Checkbox
                    value={anonymous}
                    defaultChecked={feedbackFormDetail?.anonymous}
                    onClick={() => setAnonymous(!anonymous)}
                  />
                }
                label="Anonymous"
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
              onClick={handleSubmitClick}
              text={
                feedbackFormDetail._id && isSubmitting
                  ? "Updating..."
                  : feedbackFormDetail._id
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
