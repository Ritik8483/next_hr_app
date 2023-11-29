"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";
import { closeAlert } from "@/redux/slices/snackBarSlice";
import styles from "../../pages/Login.module.css";
import { useSelector, useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../firebaseConfig";
import {
  signInWithEmail,
  storeUsersLoginToken,
} from "@/redux/slices/authSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import InputField from "@/components/resuseables/InputField";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { userLoginSchema } from "@/schema/schema";
import { AppDispatch } from "@/redux/store";
import Buttons from "@/components/resuseables/Buttons";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

interface IFormInput {
  email: string;
  password: string;
}

const UserLogin = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(userLoginSchema),
  });

  const router = useRouter();
  const auth: any = getAuth();
  const snackbar = useSelector((state: any) => state.snackbarSlice);
  const dispatch: AppDispatch = useDispatch();
  const params = useSearchParams();

  const [togglePage, settogglePage] = useState(false);
  const [usersEmail, setUsersEmail] = useState<any>([]);
  const [allUsersDetails, setAllUsersDetails] = useState<any>([]);
  const paramsId = params?.get("id");

  const getAllUsers = async () => {
    const querySnapshot: any = await getDocs(collection(db, "users"));
    const allUsersEmailData = querySnapshot?.docs?.map(
      (doc: any) => doc.data().email
    );
    const allUsersData = querySnapshot?.docs?.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllUsersDetails(allUsersData);
    setUsersEmail(allUsersEmailData);
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleSubmitForm = async (data: IFormInput) => {
    const { email, password } = data;
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
                "Signup Successful,please check your mail we have sent your an verification link",
            })
          );
          settogglePage(true);
        }
      } catch (error: any) {
        console.log(error);
        dispatch(
          openAlert({
            type: "error",
            message: error.message,
          })
        );
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
    try {
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
      }
    } catch (error: any) {
      console.log("error", error.message);
      dispatch(
        openAlert({
          type: "error",
          message: error.message,
        })
      );
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user: any) => {
      if (
        user &&
        user.emailVerified &&
        user.email !== "ritik.chauhan@quokkalabs.com"
      ) {
        const filteredUser = allUsersDetails?.filter(
          (item: any) => item.email === user.email
        );
        dispatch(storeUsersLoginToken(filteredUser[0]));
        if (filteredUser[0]) {
          router.push(`/form?id=${paramsId}`);
        }
      } else {
        router.push(`/user-login?id=${paramsId}`);
      }
    });
  }, [allUsersDetails?.length]);

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
        {togglePage ? (
          <>
            <Typography textAlign="center">User Login</Typography>
            <form
              className={styles.formContainer}
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
                  onClick={() => settogglePage(false)}
                >
                  Signup
                </Typography>
              </Box>
            </form>
          </>
        ) : (
          <>
            <Typography textAlign="center">User Signup</Typography>
            <form
              className={styles.formContainer}
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
                  onClick={() => settogglePage(true)}
                >
                  Login
                </Typography>
              </Box>
            </form>
          </>
        )}
      </Box>

      {snackbar.snackbarState && (
        <Snackbar
          open={snackbar.snackbarState}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          autoHideDuration={2500}
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
