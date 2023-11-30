"use client";

import Buttons from "@/components/resuseables/Buttons";
import InputField from "@/components/resuseables/InputField";
import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { db } from "@/firebaseConfig";
import { Box, Typography } from "@mui/material";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { storeUsersLoginToken } from "@/redux/slices/authSlice";

const FillFeedbackForm = () => {
  const searchParams: any = useSearchParams();
  const router = useRouter();
  const auth: any = getAuth();
  const dispatch = useDispatch();

  const [feedbackParametersArr, setFeedbackParametersArr] = useState<any>([]);
  const [validate, setValidate] = useState(false);
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

  useEffect(() => {
    onAuthStateChanged(auth, (user: any) => {
      if (user && user.email !== "ritik.chauhan@quokkalabs.com") {
        router.push(`/form?id=${feedbackId}`);
      } else {
        router.push("/user-login");
        dispatch(storeUsersLoginToken(null));
      }
    });
  }, []);

  const getFeedbacksData = async () => {
    try {
      const docRef = doc(db, "feedback_form", feedbackId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormQueDetails(docSnap?.data());
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
  }, []);

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
      const userId = doc(db, "feedback_form", feedbackId);
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
      await updateDoc(userId, payload);
      dispatch(storeUsersLoginToken(null));
      alert("Form Submitted Successfully");
      signOut(auth)
        .then(() => {
          router.push(`/user-login?id=${feedbackId}`);
        })
        .catch((error: any) => {
          console.log("error", error);
        });
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

  return (
    <>
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <form
          style={{
            border: "1px solid black",
            borderRadius: "10px",
            padding: "20px",
            width: "50%",
          }}
          onSubmit={handleSubmit}
        >
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
                    <Typography variant="h6">
                      {index + 1}. {item.feedbackName}
                    </Typography>
                    <Typography>
                      Description : {item.feedbackDescription}
                    </Typography>
                    {item.feedback_parameter_type ===
                    "Both Score and Description" ? (
                      <Box key={item.feedbackName} marginBottom="10px">
                        <Slider
                          sx={{ padding: "30px 0" }}
                          defaultValue={0}
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
                        {validate &&
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
                          )}
                        <InputField
                          type="text"
                          onChange={(e: any) =>
                            handleDescChange(item.id, e.target.value)
                          }
                          value={
                            formData.find((data) => data.id === item.id)
                              ?.description || ""
                          }
                          size="small"
                          key={item.feedbackName}
                          name={item.feedbackName}
                          id="score"
                          multiline
                          rows={4}
                          placeholder="Description"
                        />
                        {validate &&
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
                          )}
                      </Box>
                    ) : item.feedback_parameter_type === "Description" ? (
                      <>
                        <InputField
                          type="text"
                          sx={{ padding: "10px 0" }}
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
                          // errorMessage={errors.email?.message}
                        />

                        {validate &&
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
                          )}
                      </>
                    ) : (
                      <>
                        <Slider
                          sx={{ padding: "30px 0" }}
                          aria-label="Temperature"
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
                        {validate &&
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
                          )}
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
              onClick={() => setValidate(true)}
              // disabled={isSubmitting}
              text="Submit"
            />
          </Box>
        </form>
      </Box>
    </>
  );
};

export default FillFeedbackForm;
