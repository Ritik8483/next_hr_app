"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";
import { closeAlert } from "@/redux/slices/snackBarSlice";
import { useSelector, useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../firebaseConfig";
import { storeUsersLoginToken } from "@/redux/slices/authSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import InputField from "@/components/resuseables/InputField";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { userForgotPasswordSchema, userLoginSchema } from "@/schema/schema";
import { AppDispatch } from "@/redux/store";
import Buttons from "@/components/resuseables/Buttons";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { formContainer } from "@/styles/styles";

interface IFormInput {
  email: string;
  password: string;
}

const UserLogin = () => {
  const router = useRouter();
  const auth: any = getAuth();
  const snackbar = useSelector((state: any) => state.snackbarSlice);
  const dispatch: AppDispatch = useDispatch();
  const params = useSearchParams();

  const [togglePage, settogglePage] = useState("signup");
  const [usersEmail, setUsersEmail] = useState<any>([]);
  const [feedbackResponses, setFeedbackResponses] = useState<any>({});
  const [allUsersDetails, setAllUsersDetails] = useState<any>([]);
  const paramsId = params?.get("id");

  const userCreds = useSelector(
    (state: any) => state.authSlice.userLoginDetails
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(
      togglePage === "forgotpassword"
        ? userForgotPasswordSchema
        : userLoginSchema
    ),
  });

  const getAllUsers = async () => {
    const docRef = doc(db, "feedback_form", paramsId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      if (docSnap.data()) {
        setFeedbackResponses(docSnap.data());
      }
    }
    const querySnapshot: any = await getDocs(collection(db, "users"));
    const allUsersEmailData = querySnapshot?.docs?.map(
      (doc: any) => doc.data().email
    );
    const allUsers = querySnapshot?.docs?.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllUsersDetails(allUsers);
    setUsersEmail(allUsersEmailData);
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleSubmitForm = async (data: IFormInput) => {
    const { email, password } = data;
    const querySnapshot: any = await getDocs(collection(db, "signup_users"));
    const allRolesData = querySnapshot?.docs?.map((doc: any) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    if (usersEmail?.includes(email)) {
      try {
        const signupResult: any = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (signupResult?.user?.accessToken) {
          const resp: any = await sendEmailVerification(auth?.currentUser);
          dispatch(
            openAlert({
              type: "success",
              message:
                "Signup Successful,please check your mail for verification.",
            })
          );
          settogglePage("login");
          const userId = doc(db, "signup_users", allRolesData[0]?.id);

          await updateDoc(userId, {
            signup_users: [...allRolesData[0]?.signup_users, email],
          });
          reset();
        }
      } catch (error: any) {
        console.log(error.code);
        if (error.code === "auth/email-already-in-use") {
          dispatch(
            openAlert({
              type: "error",
              message:
                "Account already exists with this email,please login to continue",
            })
          );
        } else {
          dispatch(
            openAlert({
              type: "error",
              message: error.message,
            })
          );
        }
      }
    } else {
      dispatch(
        openAlert({
          type: "error",
          message: "Please enter official email address",
        })
      );
    }

    //Sign In Link Method
    // try {
    //   const resp = await sendSignInLinkToEmail(auth, data.email, {
    //     url: "http://localhost:3000/form",
    //     handleCodeInApp: true,
    //     dynamicLinkDomain: "qlfeedbackapp.page.link",
    //   })
    //     .then((response: any) => {
    //       console.log("response", response);
    //     })
    //     .catch((error) => {
    //       console.log("error", error);
    //     });
    //   console.log("resp", resp);
    // } catch (error) {
    //   console.log("error", error);
    // }
  };

  const handleLoginForm = async (data: IFormInput) => {
    const { email, password } = data;
    const querySnapshot: any = await getDocs(collection(db, "signup_users"));
    const allRolesData = querySnapshot?.docs?.map((doc: any) => {
      return {
        ...doc.data(),
      };
    });
    if (usersEmail?.includes(email)) {
      if (
        auth?.currentUser?.emailVerified ??
        allRolesData[0]?.signup_users?.includes(email)
      ) {
        try {
          if (
            feedbackResponses?.responses?.some((it: any) => it.email === email)
          ) {
            dispatch(
              openAlert({
                type: "error",
                message: "Form already Submitted by you",
              })
            );
            return;
          } else {
            const result: any = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );

            if (result?.user?.accessToken) {
              const filteredUser = allUsersDetails?.filter(
                (item: any) => item.email === result?.user?.email
              );
              dispatch(storeUsersLoginToken(filteredUser[0]));
              router.push(`/form?id=${paramsId}`);
              reset();
            }
          }
        } catch (error: any) {
          console.log("error", error.message);
          if (error.code === "auth/invalid-login-credentials") {
            dispatch(
              openAlert({
                type: "error",
                message: "Invalid Credentials",
              })
            );
          } else {
            dispatch(
              openAlert({
                type: "error",
                message: error.message,
              })
            );
          }
        }
      } else {
        if (!allRolesData[0]?.signup_users?.includes(email)) {
          dispatch(
            openAlert({
              type: "error",
              message: "Email not found,please signup",
            })
          );
        } else {
          // setActiveState(!activeState)
          dispatch(
            openAlert({
              type: "error",
              message:
                "Please verify your email address and try again after refreshing",
            })
          );
        }
      }
    } else {
      dispatch(
        openAlert({
          type: "error",
          message: "Please enter official email address.",
        })
      );
    }
  };

  useEffect(() => {
    if (userCreds?.email) {
      router.push(`/form?id=${paramsId}`);
    } else {
      router.push(`/user-login?id=${paramsId}`);
    }
  }, []);

  const handleForgotForm = async (data: any) => {
    const querySnapshot: any = await getDocs(collection(db, "signup_users"));
    const allRolesData = querySnapshot?.docs?.map((doc: any) => {
      return {
        ...doc.data(),
      };
    });
    if (allRolesData[0]?.signup_users?.includes(data?.email)) {
      try {
        sendPasswordResetEmail(auth, data.email)
          .then((resp: any) => {
            dispatch(
              openAlert({
                type: "success",
                message: "Password reset email sent to your email address",
              })
            );
            reset();
            settogglePage("login");
          })
          .catch((error) => {
            console.log("error", error);
          });
      } catch (error) {
        console.log("error", error);
      }
    } else {
      dispatch(
        openAlert({
          type: "error",
          message: "Email is not found",
        })
      );
    }
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        gap="20px"
        justifyContent="center"
        minHeight="100vh"
        width="100%"
      >
        {togglePage === "login" ? (
          <>
            <Typography textAlign="center">User Login</Typography>
            <form
              style={formContainer}
              onSubmit={handleSubmit(handleLoginForm)}
            >
              <Box display="flex" flexDirection="column" gap="20px">
                <InputField
                  type="email"
                  register={register}
                  id="email"
                  name="email"
                  placeholder="Email"
                  errorMessage={errors.email?.message}
                />
                <InputField
                  type="password"
                  register={register}
                  id="password"
                  name="password"
                  placeholder="Password"
                  errorMessage={errors.password?.message}
                />
                <Buttons
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  text="Login"
                />
              </Box>
              <Box display="flex" alignItems="center" gap="5px" fontSize="12px">
                Don't have an account?
                <Typography
                  color="blue"
                  fontSize="12px"
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    reset();
                    settogglePage("signup");
                  }}
                >
                  Signup
                </Typography>
              </Box>
              <Typography
                color="blue"
                fontSize="12px"
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  reset();
                  settogglePage("forgotpassword");
                }}
              >
                Forgot Password?
              </Typography>
            </form>
          </>
        ) : togglePage === "forgotpassword" ? (
          <>
            <Typography textAlign="center">Forgot Password?</Typography>
            <form
              style={formContainer}
              onSubmit={handleSubmit(handleForgotForm)}
            >
              <Box display="flex" flexDirection="column" gap="20px">
                <InputField
                  type="email"
                  register={register}
                  id="email"
                  name="email"
                  placeholder="Email"
                  errorMessage={errors.email?.message}
                />
                <Buttons
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  text="Send Email"
                />
              </Box>
              <Box display="flex" alignItems="center" gap="5px" fontSize="12px">
                Already have an account?
                <Typography
                  color="blue"
                  fontSize="12px"
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    reset();
                    settogglePage("login");
                  }}
                >
                  Login
                </Typography>
              </Box>
            </form>
          </>
        ) : (
          <>
            <Typography textAlign="center">User Signup</Typography>
            <form
              style={formContainer}
              onSubmit={handleSubmit(handleSubmitForm)}
            >
              <Box display="flex" flexDirection="column" gap="20px">
                <InputField
                  type="email"
                  register={register}
                  id="email"
                  name="email"
                  placeholder="Email"
                  errorMessage={errors.email?.message}
                />
                <InputField
                  type="password"
                  register={register}
                  id="password"
                  name="password"
                  placeholder="Password"
                  errorMessage={errors.password?.message}
                />
                <Buttons
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  text="Signup"
                />
              </Box>
              <Box display="flex" alignItems="center" gap="5px" fontSize="12px">
                Already have an account?
                <Typography
                  color="blue"
                  fontSize="12px"
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    reset();
                    settogglePage("login");
                  }}
                >
                  Login
                </Typography>
              </Box>
              <Typography
                color="blue"
                fontSize="12px"
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  reset();
                  settogglePage("forgotpassword");
                }}
              >
                Forgot Password?
              </Typography>
            </form>
          </>
        )}
      </Box>

      {snackbar.snackbarState && (
        <Snackbar
          open={snackbar.snackbarState}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          autoHideDuration={3500}
          onClose={() =>
            dispatch(
              closeAlert({
                message: "",
                type: "",
              })
            )
          }
        >
          <Alert
            onClose={() =>
              dispatch(
                closeAlert({
                  message: "",
                  type: "",
                })
              )
            }
            severity={snackbar.snackbarType}
            sx={{ width: "100%" }}
          >
            {snackbar.snackbarMessage}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default UserLogin;
