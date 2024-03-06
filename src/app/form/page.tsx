"use client";

import Buttons from "@/components/resuseables/Buttons";
import InputField from "@/components/resuseables/InputField";
import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import styles from "../page.module.css";
import {
  Box,
  FormControlLabel,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from "@mui/material";

import { useSearchParams } from "next/navigation";
import CheckIcon from "@mui/icons-material/Check";
import React, { Fragment, useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import { ETM, MTE, SA } from "@/constants/constant";
import {
  useGetSingleFeedbackFormDetailQuery,
  useGetSingleUserQuery,
  useUpdateFeedbackFormMutation,
} from "@/redux/api/api";

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

const sliderLabels = [
  {
    value: 0,
    label: 0,
  },
  {
    value: 1,
    label: 1,
  },
  {
    value: 2,
    label: 2,
  },
  {
    value: 3,
    label: 3,
  },
  {
    value: 4,
    label: 4,
  },
  {
    value: 5,
    label: 5,
  },
  {
    value: 6,
    label: 6,
  },
  {
    value: 7,
    label: 7,
  },
  {
    value: 8,
    label: 8,
  },
  {
    value: 9,
    label: 9,
  },
  {
    value: 10,
    label: 10,
  },
];

const FillFeedbackForm = () => {
  const searchParams: any = useSearchParams();
  const [validate, setValidate] = useState(false);
  const [value, setValue] = useState("");
  const [activePage, setActivePage] = useState(false);
  const [formData, setFormData] = useState<
    Array<{
      _id: string;
      input: string;
      score?: number;
      description: string;
      option: "string";
    }>
  >([]);
  const feedbackId = searchParams.get("id");

  const payload = {
    url: "feedback-form",
    id: feedbackId?.split("?")[0],
  };
  const { data, isLoading, refetch, isFetching } =
    useGetSingleFeedbackFormDetailQuery(payload, {
      refetchOnMountOrArgChange: true,
    });

  console.log("data", data);
  console.log("feedbackId",feedbackId.split("=")[1]);
  

  const payloadUser = {
    url: "users",
    id: feedbackId.split("=")[1],
  };
  const { data: feedbackReviewer } = useGetSingleUserQuery(payloadUser);

  console.log("feedbackReviewer", feedbackReviewer);

  const [updateFeedbackForm] = useUpdateFeedbackFormMutation();
  const [feedbackUser, setFeedbackUser] = useState<any>(
    data?.data?.feedback_type === ETM && data?.data?.review?.length === 1
      ? data?.data?.review[0]
      : {}
  );

  const initialFeedbackFrom = () => {
    if (data?.data?._id) {
      const obj: any = data?.data?.feedback_parameters?.map((item: any) => {
        return {
          _id: item._id,
          ...(item.feedback_parameter_type === "MCQ" ||
          item.feedback_parameter_type === "Input"
            ? {}
            : { score: "" }),
          ...(item.feedback_parameter_type === "MCQ" ||
          item.feedback_parameter_type === "Input"
            ? {}
            : { description: "" }),
          ...(item.feedback_parameter_type === "MCQ" ? { option: "" } : {}),
          ...(item.feedback_parameter_type === "Input" ? { input: "" } : {}),
          type: item.feedback_parameter_type,
          feedbackName: item.feedbackName,
        };
      });
      setFormData(obj);
    }
  };
  useEffect(() => {
    initialFeedbackFrom();
  }, [data?.data]);

  const allPrevData = {
    ...data?.data,
    feedback_parameters: data?.data?.feedback_parameters?.map(
      (it: any) => it._id
    ),
    review:
      data?.data?.feedback_type === SA
        ? undefined
        : data?.data?.review?.map((it: any) => it._id),
    reviewer: data?.data?.reviewer?.map((it: any) => it._id),
  };

  const isValid = formData.some((item: any) => {
    if (item.type === "Both Score and Description") {
      return item.score === "" || item.description.trim() === "";
    } else if (item.type === "MCQ") {
      return item.option === "";
    } else if (item.type === "Input") {
      return item.input === "";
    } else if (item.type === "Description") {
      return item.score === "" && item.description.trim() === "";
    } else if (item.type === "Score") {
      return item.description.trim() === "" && item.score === "";
    } else false;
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isValid) {
      return;
    }

    try {
      const payload = data?.data?.feedback_type === ETM && {
        ...allPrevData,
        responses: data?.data?.responses?.length
          ? [
              ...data?.data?.responses,
              {
                ...feedbackReviewer.data,
                userProgress: [
                  { ...data?.data?.review[0], form_response: formData },
                ],
              },
            ]
          : data?.data?.reviewer
              ?.map((it: any) => {
                if (it._id === feedbackId.split("=")[1]) {
                  return {
                    ...it,
                    userProgress: [
                      { ...data?.data?.review[0], form_response: formData },
                    ],
                  };
                }
              })
              .filter((item: any) => item !== undefined),
      };

      const payloadETMAnonymous = data?.data?.feedback_type === ETM &&
        data?.data?.anonymous && {
          ...allPrevData,
          people_reviewed: data?.data?.people_reviewed
            ? [...data?.data?.people_reviewed, feedbackReviewer?.data?._id]
            : [feedbackReviewer?.data?._id],
          responses: data?.data?.responses?.length
            ? [...data?.data?.responses, ...formData]
            : [...formData],
        };

      const payloadSelfAssessment = data?.data?.feedback_type === SA && {
        ...allPrevData,
        responses: data?.data?.responses?.length
          ? [
              ...data?.data?.responses,
              { ...feedbackReviewer.data, form_response: formData },
            ]
          : data?.data?.reviewer
              ?.map((it: any) => {
                if (it._id === feedbackReviewer?.data?._id) {
                  return {
                    ...it,
                    form_response: formData,
                  };
                }
              })
              .filter((item: any) => item !== undefined),
      };

      const payloadMTE = data?.data?.feedback_type === MTE && {
        ...allPrevData,
        responses: data?.data?.responses?.length
          ? data?.data?.responses?.map((it: any) => {
              if (
                it._id === feedbackReviewer?.data?._id &&
                Object.keys(it).includes("userProgress")
              ) {
                return {
                  ...it,
                  userProgress: [
                    ...it?.userProgress,
                    { ...feedbackUser, form_response: formData },
                  ],
                };
              } else if (it._id === feedbackReviewer?.data?._id) {
                return {
                  ...it,
                  userProgress: [{ ...feedbackUser, form_response: formData }],
                };
              } else {
                return it;
              }
            })
          : data?.data?.reviewer?.map((it: any) => {
              if (feedbackUser._id && it._id === feedbackReviewer?.data?._id) {
                return {
                  ...feedbackReviewer?.data,
                  userProgress: [{ ...feedbackUser, form_response: formData }],
                };
              } else return it;
            }),
      };

      const payloadSingleMTE = data?.data?.feedback_type === MTE &&
        data?.data?.review?.length === 1 && {
          ...allPrevData,
          responses: data?.data?.responses?.length
            ? [
                ...data?.data?.responses,
                {
                  ...feedbackReviewer?.data,
                  userProgress: [
                    { ...data?.data?.review[0], form_response: formData },
                  ],
                },
              ]
            : [
                {
                  ...feedbackReviewer?.data,
                  userProgress: [
                    { ...data?.data?.review[0], form_response: formData },
                  ],
                },
              ],
        };

      const responsePayload = {
        url: "feedback-form",
        id: feedbackId,
        body:
          data?.data?.feedback_type === MTE && data?.data?.review?.length === 1
            ? payloadSingleMTE
            : data?.data?.feedback_type === MTE
            ? payloadMTE
            : data?.data?.feedback_type === SA
            ? payloadSelfAssessment
            : data?.data?.feedback_type === ETM && data?.data?.anonymous
            ? payloadETMAnonymous
            : payload,
      };
      const resp = await updateFeedbackForm(responsePayload).unwrap();
      if (resp?.code) {
        setFeedbackUser("");
        refetch;
        initialFeedbackFrom();
      }
    } catch (error) {
      console.log(error);
    }
    setValidate(false);
  };

  useEffect(() => {
    const reviewerETMArr =
      data?.data?.feedback_type === ETM &&
      data?.data?.responses
        ?.map((item: any) => {
          if (Object.keys(item).includes("userProgress")) {
            return item;
          }
        })
        .filter((item: any) => item !== undefined);

        console.log("reviewerETMArr",reviewerETMArr);
        

    const reviewerSA =
      data?.data?.feedback_type === SA &&
      data?.data?.responses
        ?.map((item: any) => {
          if (Object.keys(item).includes("form_response")) {
            return item;
          }
        })
        .filter((item: any) => item !== undefined);

    const resp =
      data?.data?.feedback_type === MTE &&
      data?.data?.review?.every((it: any) =>
        feedbacksSubmittedFor().includes(it._id)
      );

    const response =
      data?.data?.feedback_type === ETM &&
      (data?.data?.feedback_type === ETM && data?.data?.reviewer?.length === 1
        ? data?.data?.review?.length === data?.data?.responses?.length
        : reviewerETMArr?.some(
            (item: any) => item?._id === feedbackId.split("=")[1]
          ));

    const responseSA =
      data?.data?.feedback_type === SA &&
      data?.data?.feedback_type === SA &&
      reviewerSA?.some(
        (item: any) => item?._id === feedbackReviewer?.data?._id
      );

    const finalRespAnonymous =
      data?.data?.feedback_type === ETM &&
      data?.data?.anonymous &&
      data?.data?.reviewer?.some(
        (it: any) =>
          window.location.search.split("user=")[1] === it._id &&
          data?.data?.people_reviewed?.includes(it._id)
      );

      console.log("response",response);
      

    if (resp || responseSA || response || finalRespAnonymous) {
      setActivePage(true);
    } else {
      setActivePage(false);
    }
  }, [isFetching]);

  const handleScoreChange = (id: string, score: number) => {
    setFormData((prevData) =>
      prevData.map((item: any) => (item._id === id ? { ...item, score } : item))
    );
  };

  const handleDescChange = (id: string, description: string) => {
    setFormData((prevData) =>
      prevData.map((item: any) =>
        item._id === id ? { ...item, description } : item
      )
    );
  };

  const handleInputChange = (id: string, input: string) => {
    setFormData((prevData) =>
      prevData.map((item: any) => (item._id === id ? { ...item, input } : item))
    );
  };

  const handleMCQOptionChange = (id: string, option: string) => {
    setFormData((prevData) =>
      prevData.map((item: any) =>
        item._id === id ? { ...item, option } : item
      )
    );
  };

  const valuetext = (value: number) => {
    return value.toString();
  };

  const handleFeedbackOfChange = (item: any) => {
    setFeedbackUser(item);
  };

  const feedbacksSubmittedFor = () => {
    const userProgresses = data?.data?.responses?.map((it: any) => {
      if (it?._id === feedbackReviewer?.data?._id) {
        return it?.userProgress;
      }
    });

    const filteredArr =
      data?.data?.feedback_type === MTE &&
      userProgresses?.filter((item: any) => item !== undefined);

    return filteredArr?.flat()?.map((it: any) => it?._id);
  };

  return (
    <>
      <Box
        justifyContent={activePage ? "start" : "center"}
        className={styles.mainformContainer}
      >
        {!activePage ? (
          <>
            <Box className={styles.enpsTextStyle}>
              <Typography fontSize="24px" color="#fff">
                Your Matter(eNPS)
              </Typography>
            </Box>
            <form
              className={styles.formToFillupContainer}
              onSubmit={handleSubmit}
            >
              <Typography color="#595c6f" fontSize="14px" marginBottom="30px">
                *Required
              </Typography>
              {(data?.data?.feedback_type === MTE &&
                data?.data?.review?.length === 1) ||
              data?.data?.feedback_type === ETM ||
              data?.data?.feedback_type === SA ? null : (
                <Box marginBottom="20px">
                  <InputLabel
                    sx={{ fontSize: "12px", color: "var(--iconGrey)" }}
                  >
                    Select feedback for
                  </InputLabel>
                  <Select
                    sx={{ width: "100%", color: "var(--iconGrey)" }}
                    value={feedbackUser}
                    displayEmpty
                    input={<OutlinedInput />}
                    renderValue={(selected: any) => {
                      if (
                        selected === undefined ||
                        !Object.keys(selected).length
                      ) {
                        return <>Review</>;
                      }

                      return selected.firstName + " " + selected.lastName;
                    }}
                    MenuProps={MenuProps}
                  >
                    {data?.data?.review?.map((it: any) => (
                      <MenuItem
                        key={it._id}
                        value={it}
                        disabled={
                          data?.data?.feedback_type !== ETM &&
                          feedbacksSubmittedFor()?.includes(it._id)
                        }
                        onClick={() => handleFeedbackOfChange(it)}
                      >
                        {data?.data?.feedback_type !== ETM &&
                        feedbacksSubmittedFor()?.includes(it._id) ? (
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Typography>
                              {it.firstName + " " + it.lastName}
                            </Typography>
                            <CheckIcon />
                          </Box>
                        ) : (
                          it.firstName + " " + it.lastName
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
              {isLoading ? (
                <Box display="flex" flexDirection="column" gap="20px">
                  {Array.from({ length: 8 }).map((_, index) => {
                    const uniqueKey = `item_${index}`;
                    return (
                      <Fragment key={uniqueKey}>
                        <SkeletonTable
                          variant="rounded"
                          width="100%"
                          height="40px"
                        />
                      </Fragment>
                    );
                  })}
                </Box>
              ) : data?.data?.feedback_parameters?.length ? (
                data?.data?.feedback_parameters?.map(
                  (item: any, index: number) => {
                    return (
                      <>
                        <Box>
                          <Box display="flex">
                            <Typography variant="h6">
                              {index + 1}. {item.feedbackName + "*"}
                            </Typography>
                          </Box>
                          {item.feedbackDescription && (
                            <Typography>
                              Description : {item.feedbackDescription}
                            </Typography>
                          )}
                          {item.feedback_parameter_type === "Input" ? (
                            <InputField
                              type="text"
                              disabled={
                                !feedbackUser &&
                                data?.data?.review?.length !== 1
                              }
                              sx={{
                                margin: "10px 0",
                                backgroundColor: "#fff",
                                "& fieldset": { border: "none" },
                                borderRadius: "5px",
                              }}
                              size="small"
                              value={
                                formData?.find(
                                  (data: any) => data._id === item._id
                                )?.input || ""
                              }
                              onChange={(e: any) =>
                                handleInputChange(item._id, e.target.value)
                              }
                              id="input"
                              name={item.feedbackName}
                            />
                          ) : item.feedback_parameter_type === "MCQ" ? (
                            <RadioGroup
                              sx={{ margin: "15px 0" }}
                              aria-labelledby="demo-controlled-radio-buttons-group"
                              name="controlled-radio-buttons-group"
                              value={
                                formData?.find(
                                  (data: any) => data._id === item._id
                                )?.option || ""
                              }
                              onChange={(e: any) =>
                                handleMCQOptionChange(item._id, e.target.value)
                              }
                            >
                              {item?.mcqOption?.map(
                                (it: string, index: number) => {
                                  return (
                                    <FormControlLabel
                                      disabled={
                                        !feedbackUser &&
                                        data?.data?.review?.length !== 1
                                      }
                                      key={it + index}
                                      value={it}
                                      control={<Radio />}
                                      label={it}
                                    />
                                  );
                                }
                              )}
                            </RadioGroup>
                          ) : item.feedback_parameter_type ===
                            "Both Score and Description" ? (
                            <Box key={item.feedbackName} marginBottom="10px">
                              <Slider
                                sx={{ margin: "30px 0" }}
                                marks={sliderLabels}
                                defaultValue={0}
                                value={formData[index]?.score || 0}
                                disabled={
                                  !feedbackUser &&
                                  data?.data?.review?.length !== 1
                                }
                                getAriaValueText={valuetext}
                                onChange={(e, value) =>
                                  handleScoreChange(item._id, value as number)
                                }
                                name={item.feedbackName}
                                valueLabelDisplay="auto"
                                step={1}
                                min={0}
                                max={10}
                              />
                              {/* {validate &&
                            !formData.find((data) => data.id === item.id)
                              ?.score && (
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  color: "red",
                                }}
                              >
                                Please select a number
                              </Typography>
                            )} */}
                              <InputField
                                type="text"
                                disabled={
                                  !feedbackUser &&
                                  data?.data?.review?.length !== 1
                                }
                                onChange={(e: any) =>
                                  handleDescChange(item._id, e.target.value)
                                }
                                value={
                                  formData.find(
                                    (data: any) => data._id === item._id
                                  )?.description || ""
                                }
                                size="small"
                                sx={{
                                  backgroundColor: "#fff",
                                  "& fieldset": { border: "none" },
                                  borderRadius: "5px",
                                }}
                                key={item.feedbackName}
                                InputProps={{
                                  disableUnderline: true,
                                }}
                                name={item.feedbackName}
                                id="score"
                                multiline
                                rows={4}
                                placeholder="Description"
                              />
                              {/* {validate &&
                            !formData.find((data) => data.id === item.id)
                              ?.description && (
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  color: "red",
                                }}
                              >
                                Please provide a description
                              </Typography>
                            )} */}
                            </Box>
                          ) : item.feedback_parameter_type === "Description" ? (
                            <>
                              <InputField
                                type="text"
                                disabled={
                                  !feedbackUser &&
                                  data?.data?.review?.length !== 1
                                }
                                sx={{
                                  marginTop: "10px",
                                  backgroundColor: "#fff",
                                  "& fieldset": { border: "none" },
                                  borderRadius: "5px",
                                }}
                                size="small"
                                value={
                                  formData?.find(
                                    (data: any) => data._id === item._id
                                  )?.description || ""
                                }
                                onChange={(e: any) =>
                                  handleDescChange(item._id, e.target.value)
                                }
                                id="score"
                                multiline
                                name={item.feedbackName}
                                rows={4}
                                placeholder="Description"
                              />

                              {/* {validate &&
                            !formData.find((data) => data.id === item.id)
                              ?.description && (
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  color: "red",
                                }}
                              >
                                Please provide a description
                              </Typography>
                            )} */}
                            </>
                          ) : (
                            <>
                              <Slider
                                sx={{ margin: "30px 0" }}
                                marks={sliderLabels}
                                value={formData[index]?.score || 0}
                                disabled={
                                  !feedbackUser &&
                                  data?.data?.review?.length !== 1
                                }
                                defaultValue={0}
                                name={item.feedbackName}
                                getAriaValueText={valuetext}
                                onChange={(e, value) =>
                                  handleScoreChange(item._id, value as number)
                                }
                                valueLabelDisplay="auto"
                                step={1}
                                min={0}
                                max={10}
                              />
                              {/* {validate &&
                            !formData.find((data) => data.id === item.id)
                              ?.score && (
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  color: "red",
                                }}
                              >
                                Please select a number
                              </Typography>
                            )} */}
                            </>
                          )}
                        </Box>
                      </>
                    );
                  }
                )
              ) : (
                <NoDataFound text="No data Found" />
              )}

              <Box textAlign="end" marginTop="20px">
                <Buttons
                  type="submit"
                  variant="contained"
                  // disabled={
                  //   Array.isArray(data?.data?.review) &&
                  //   peoplesToReviewArr?.length !== 1 &&
                  //   !feedbackUser &&
                  //   data?.data?.review?.length !== 1
                  // }
                  disabled={
                    (!feedbackUser && data?.data?.review?.length !== 1) ||
                    isValid
                  }
                  onClick={() => setValidate(true)}
                  text="Submit"
                />
              </Box>
            </form>
          </>
        ) : (
          <>
            <Box className={styles.formSubmissionStyle}>
              <Typography fontSize="24px" color="#000">
                Thank you
              </Typography>
              <Typography fontSize="14px" color="#000">
                Your response was submitted successfully.Thank you
              </Typography>
              <Typography fontSize="14px" color="#000">
                Keep the information with you by saving your response.
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default FillFeedbackForm;
