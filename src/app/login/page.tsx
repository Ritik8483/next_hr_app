"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Box } from "@mui/material";
// import styles from "./Login.module.css";
import styles from "../../pages/Login.module.css";
import { useSelector, useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { redirect, useRouter } from "next/navigation";
import { auth } from "@/firebaseConfig";
import { signInWithEmail, storeLoginToken } from "@/redux/slices/authSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/resuseables/InputField";
import { openAlert } from "@/redux/slices/snackBarSlice";

interface IFormInput {
  email: string;
  password: string;
}

const schema = yup
  .object({
    email: yup.string().required("Email is required"),
    password: yup.string().min(8).required("Password is required"),
  })
  .required();

const Login = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const dispatch: any = useDispatch();

  const accessToken = useSelector((state: any) => state.authSlice.userToken);
  console.log("accessToken", accessToken);

  useEffect(() => {
    console.log("useEffect called");

    if (accessToken === null) router.push("/login");
    // else redirect("/");
  }, []);

  const handleSubmitForm = async (data: IFormInput) => {
    try {
      const reqObj = { auth, email: data.email, password: data.password };
      const resp: any = await dispatch(signInWithEmail(reqObj)).unwrap();
      if (resp?.user?.accessToken) {
        router.push("/home");
        dispatch(
          openAlert({
            type: "success",
            message: "User logged in successfully!",
          })
        );
      }
    } catch (error) {
      dispatch(
        openAlert({
          type: "error",
          message: "Invalid login credentials",
        })
      );

      console.log("error", error);
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
        <Typography textAlign="center">QL Feedback App</Typography>
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
              register={register}
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              errorMessage={errors.password?.message}
            />

            <Button type="submit" variant="contained">
              Login
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
};

export default Login;

//FOR CALLING API WITH THUNK
//   const { entities, loading, error } = useSelector(
//     (state: any) => state.authSlice
//   );
//   useEffect(() => {
//     const fetchOneUser = async () => {
//       try {
//         const user = await dispatch(fetchUserById(1)).unwrap();
//         console.log("user", user);
//       } catch (err) {
//         console.log("err", err);
//       }
//     };

//     fetchOneUser();
//   }, []);
