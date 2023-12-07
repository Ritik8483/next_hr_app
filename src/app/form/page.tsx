"use client";

import Buttons from "@/components/resuseables/Buttons";
import InputField from "@/components/resuseables/InputField";
import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { db } from "@/firebaseConfig";
import {
  Box,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import CheckIcon from "@mui/icons-material/Check";
import React, { Fragment, useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import { storeUsersLoginToken } from "@/redux/slices/authSlice";
import { ETM, MTE } from "@/constants/constant";

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

const FillFeedbackForm = () => {
  const searchParams: any = useSearchParams();
  const router = useRouter();
  const auth: any = getAuth();
  const dispatch = useDispatch();

  const [feedbackParametersArr, setFeedbackParametersArr] = useState<any>([]);
  const [peoplesToReviewArr, setPeoplesToReviewArr] = useState<any>([]);
  const [validate, setValidate] = useState(false);
  const [state, setState] = useState(false);
  const [feedbackUser, setFeedbackUser] = useState<any>("");
  const [formQueDetails, setFormQueDetails] = useState<any>({});
  const [formData, setFormData] = useState<
    Array<{ id: string; score?: number; description: string }>
  >([]);
  const feedbackId = searchParams.get("id");

  const feedbackReviewerEmail = useSelector(
    (state: any) => state.authSlice.userLoginDetails
  );

  const getAllFeedbackParameters = async (item: string) => {
    const docRef = doc(db, "feedbacks", item);
    const docSnap: any = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap?.data(),
      };
    }
  };

  const getFeedbacksData = async () => {
    try {
      const docRef = doc(db, "feedback_form", feedbackId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormQueDetails(docSnap?.data());
        if (Array.isArray(docSnap?.data()?.review)) {
          const filterUserArr = docSnap
            ?.data()
            ?.review?.map((it: any) => it.id);
          const usersArr = filterUserArr?.filter(
            (it: string) => it !== undefined
          );
          const arrOfUsers = docSnap
            ?.data()
            ?.review?.filter((it: any) =>
              Object.keys(it).some((key) => key.includes("firstName"))
            );

          const dd = docSnap
            ?.data()
            ?.review?.filter((it: any) =>
              Object.keys(it).some((key) => key.includes("team"))
            );

          const teamUsersArr = dd.map((it: any) => {
            return it.teamUsers.filter(
              (items: any) => !usersArr.includes(items.id)
            );
          });
          const filteredUsersFromTeams = arrOfUsers.concat(...teamUsersArr);
          setPeoplesToReviewArr(filteredUsersFromTeams);
        }

        const resp = docSnap?.data()?.feedback_parameters?.map((it: string) => {
          return getAllFeedbackParameters(it);
        });

        Promise.all(resp).then((val: any) => {
          const obj = val?.map((item: any) => {
            return {
              id: item.id,
              score: "",
              description: "",
              type: item.feedback_parameter_type,
              feedbackName: item.feedbackName,
            };
          });
          setFormData(obj);
          setFeedbackParametersArr(val);
        });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    getFeedbacksData();
  }, [state]);

  useEffect(() => {
    if (
      formQueDetails?.feedback_type === MTE &&
      Object.keys(formQueDetails?.review[0]).includes("firstName") &&
      formQueDetails?.review?.length === 1
    )
      return;
    const onlyResponseObj = formQueDetails?.responses?.filter(
      (it: any) => feedbackReviewerEmail?.email === it.email
    );
    if (
      formQueDetails?.feedback_type === MTE &&
      // formQueDetails?.responses?.length === peoplesToReviewArr?.length
      onlyResponseObj?.length === peoplesToReviewArr?.length
    ) {
      dispatch(storeUsersLoginToken(null));
      signOut(auth)
        .then(() => {
          setPeoplesToReviewArr([]);
          router.push(`/user-login?id=${feedbackId}`);
        })
        .catch((error: any) => {
          console.log("error", error);
        });
    }
  }, [peoplesToReviewArr]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const isValid = formData.some((item: any) => {
      if (item.type === "Both Score and Description") {
        return item.score === "" || item.description.trim() === "";
      } else if (item.type === "Description") {
        return item.score === "" && item.description.trim() === "";
      } else if (item.type === "Score") {
        return item.description.trim() === "" && item.score === "";
      } else false;
    });

    if (isValid) {
      return;
    }

    try {
      const payload = {
        ...formQueDetails,
        responses: formQueDetails?.responses?.length
          ? formQueDetails?.responses?.map((it: any) => {
              if (it === feedbackReviewerEmail?.id) {
                return {
                  ...feedbackReviewerEmail,
                  form_response: formData,
                };
              } else return it;
            })
          : formQueDetails?.reviewer?.map((it: any) => {
              if (it === feedbackReviewerEmail?.id) {
                return {
                  ...feedbackReviewerEmail,
                  form_response: formData,
                };
              } else return it;
            }),
      };

      const payloadMTE = Array.isArray(formQueDetails?.review) && {
        ...formQueDetails,
        responses: formQueDetails?.responses?.length
          ? [
              ...formQueDetails?.responses,
              {
                ...feedbackReviewerEmail,
                userInfo: feedbackUser,
                form_response: formData,
              },
            ]
          : formQueDetails?.reviewer?.map((it: any) => {
              if (feedbackUser.id && it === feedbackReviewerEmail?.id) {
                return {
                  ...feedbackReviewerEmail,
                  userInfo: feedbackUser,
                  form_response: formData,
                };
              } else if (
                Object.keys(formQueDetails?.review[0]).includes("firstName") &&
                formQueDetails?.review?.length === 1
              ) {
                return {
                  ...feedbackReviewerEmail,
                  userInfo:
                    Object.keys(formQueDetails?.review[0]).includes(
                      "firstName"
                    ) && formQueDetails?.review?.length === 1
                      ? formQueDetails?.review[0]
                      : feedbackUser,
                  form_response: formData,
                };
              } else if (it === feedbackReviewerEmail?.id) {
                return {
                  ...feedbackReviewerEmail,
                  form_response: formData,
                };
              } else return it;
            }),
      };
      const payloadSingleMte = Array.isArray(formQueDetails?.review) && {
        ...formQueDetails,
        responses: formQueDetails?.responses?.length
          ? [
              ...formQueDetails?.responses,
              {
                ...feedbackReviewerEmail,
                userInfo: formQueDetails?.review[0],
                form_response: formData,
              },
            ]
          : formQueDetails?.review?.map((it: any) => {
              if (
                formQueDetails?.review?.length === 1 &&
                Object.keys(formQueDetails?.review[0]).includes("firstName")
              ) {
                return {
                  ...feedbackReviewerEmail,
                  userInfo:
                    formQueDetails?.review?.length === 1 &&
                    Object.keys(formQueDetails?.review[0]).includes("firstName")
                      ? formQueDetails?.review[0]
                      : feedbackUser,
                  form_response: formData,
                };
              }
            }),
      };

      const payloadFilter = payloadMTE?.responses?.filter(
        (it: any) => typeof it === "object"
      );
      const finalPayloadMTE = { ...payloadMTE, responses: payloadFilter };

      const userId = doc(db, "feedback_form", feedbackId);
      await updateDoc(
        userId,
        formQueDetails?.feedback_type === MTE &&
          Object.keys(formQueDetails?.review[0]).includes("firstName") &&
          formQueDetails?.review?.length === 1
          ? payloadSingleMte
          : formQueDetails?.feedback_type === MTE
          ? finalPayloadMTE
          : payload
      );
      getFeedbacksData();
      if (
        formQueDetails?.feedback_type === MTE &&
        Array.isArray(formQueDetails?.review)
      ) {
        setFeedbackUser("");
        setState(!state);
        setFormData([]);
      }

      if (
        formQueDetails?.feedback_type === ETM ||
        (formQueDetails?.feedback_type === MTE &&
          formQueDetails?.review?.length === 1 &&
          Object.keys(formQueDetails?.review[0]).includes("firstName"))
      ) {
        dispatch(storeUsersLoginToken(null));
        signOut(auth)
          .then(() => {
            setPeoplesToReviewArr([]);
            router.push(`/user-login?id=${feedbackId}`);
          })
          .catch((error: any) => {
            console.log("error", error);
          });
      }
      alert("Form Submitted Successfully");
    } catch (error) {
      console.log(error);
    }
    setValidate(false);
  };

  const handleScoreChange = (id: string, score: number) => {
    setFormData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, score } : item))
    );
  };

  const handleDescChange = (id: string, description: string) => {
    setFormData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, description } : item))
    );
  };

  const valuetext = (value: number) => {
    return value.toString();
  };

  const handleFeedbackOfChange = (item: any) => {
    setFeedbackUser(item);
  };

  const feedbacksSubmittedFor =
    Array.isArray(formQueDetails?.review) &&
    formQueDetails?.responses?.map(
      (it: any) => feedbackReviewerEmail?.email === it.email && it?.userInfo?.id
    );
    
  return (
    <>
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        padding="60px 90px"
        bgcolor="#c6cade"
        borderRadius="5px"
        alignItems="center"
      >
        <Box padding="20px 50px" width="100%" bgcolor="#0037ad">
          <Typography fontSize="24px" color="#fff">
            Your Matter(eNPS)
          </Typography>
        </Box>
        <form
          style={{
            backgroundColor: "#d7e2ee",
            padding: "20px 50px",
            width: "100%",
          }}
          onSubmit={handleSubmit}
        >
          <Typography color="#595c6f" fontSize="14px" marginBottom="30px">
            *Required
          </Typography>
          {(formQueDetails?.feedback_type === MTE &&
            Array.isArray(formQueDetails?.review) &&
            formQueDetails?.review?.length === 1 &&
            peoplesToReviewArr?.length === 1) ||
          (formQueDetails?.feedback_type === ETM &&
            Object.keys(formQueDetails?.review).length) ? null : (
            <Box marginBottom="20px">
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Select feedback for
              </InputLabel>
              <Select
                sx={{ width: "100%", color: "var(--iconGrey)" }}
                value={feedbackUser}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={(selected: any) => {
                  if (selected?.length === 0 || selected === undefined) {
                    return <>Review</>;
                  }
                  return selected.firstName + " " + selected.lastName;
                }}
                MenuProps={MenuProps}
              >
                {peoplesToReviewArr?.map((it: any) => (
                  <MenuItem
                    key={it.id}
                    value={it}
                    disabled={feedbacksSubmittedFor?.includes(it.id)}
                    onClick={() => handleFeedbackOfChange(it)}
                  >
                    {feedbacksSubmittedFor?.includes(it.id) ? (
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
          {!feedbackParametersArr?.length ? (
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
          ) : feedbackParametersArr?.length ? (
            feedbackParametersArr?.map((item: any, index: number) => {
              return (
                <>
                  <Box>
                    <Box display="flex">
                      <Typography variant="h6">
                        {index + 1}. {item.feedbackName}
                      </Typography>
                      <Typography variant="h6" color="#595c6f">
                        *
                      </Typography>
                    </Box>
                    <Typography>
                      Description : {item.feedbackDescription}
                    </Typography>
                    {item.feedback_parameter_type ===
                    "Both Score and Description" ? (
                      <Box key={item.feedbackName} marginBottom="10px">
                        <Slider
                          sx={{ padding: "30px 0" }}
                          defaultValue={0}
                          value={formData[index]?.score}
                          disabled={
                            Array.isArray(formQueDetails?.review) &&
                            peoplesToReviewArr?.length !== 1 &&
                            !feedbackUser &&
                            formQueDetails?.review?.length !== 1
                          }
                          getAriaValueText={valuetext}
                          onChange={(e, value) =>
                            handleScoreChange(item.id, value as number)
                          }
                          name={item.feedbackName}
                          valueLabelDisplay="auto"
                          step={1}
                          marks
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
                            Array.isArray(formQueDetails?.review) &&
                            peoplesToReviewArr?.length !== 1 &&
                            !feedbackUser &&
                            formQueDetails?.review?.length !== 1
                          }
                          onChange={(e: any) =>
                            handleDescChange(item.id, e.target.value)
                          }
                          value={
                            formData.find((data) => data.id === item.id)
                              ?.description || ""
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
                            Array.isArray(formQueDetails?.review) &&
                            peoplesToReviewArr?.length !== 1 &&
                            !feedbackUser &&
                            formQueDetails?.review?.length !== 1
                          }
                          sx={{
                            marginTop: "10px",
                            backgroundColor: "#fff",
                            "& fieldset": { border: "none" },
                            borderRadius: "5px",
                          }}
                          size="small"
                          value={
                            formData.find((data) => data.id === item.id)
                              ?.description || ""
                          }
                          onChange={(e: any) =>
                            handleDescChange(item.id, e.target.value)
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
                          sx={{ padding: "30px 0" }}
                          value={formData[index]?.score}
                          disabled={
                            Array.isArray(formQueDetails?.review) &&
                            peoplesToReviewArr?.length !== 1 &&
                            !feedbackUser &&
                            formQueDetails?.review?.length !== 1
                          }
                          defaultValue={0}
                          name={item.feedbackName}
                          getAriaValueText={valuetext}
                          onChange={(e, value) =>
                            handleScoreChange(item.id, value as number)
                          }
                          valueLabelDisplay="auto"
                          step={1}
                          marks
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
            })
          ) : (
            <NoDataFound text="No data Found" />
          )}

          <Box textAlign="end" marginTop="20px">
            <Buttons
              type="submit"
              variant="contained"
              disabled={
                Array.isArray(formQueDetails?.review) &&
                peoplesToReviewArr?.length !== 1 &&
                !feedbackUser &&
                formQueDetails?.review?.length !== 1
              }
              onClick={() => setValidate(true)}
              text="Submit"
            />
          </Box>
        </form>
      </Box>
    </>
  );
};

export default FillFeedbackForm;
