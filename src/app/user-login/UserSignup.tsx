"use client";

import { Box, Typography } from "@mui/material";
import React from "react";
import { formContainer } from "@/styles/styles";
import InputField from "@/components/resuseables/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Buttons from "@/components/resuseables/Buttons";
import { UserLoginPageInterface } from "@/interface/Interface";
import { userSignupSchema } from "@/schema/schema";
import { useSignupAuthUserMutation } from "@/redux/api/api";
import { signupUserCode } from "@/constants/constant";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { useDispatch } from "react-redux";

const UserSignup = ({ settogglePage }: UserLoginPageInterface) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(userSignupSchema),
  });
  const [signupAuthUser] = useSignupAuthUserMutation();

  const handleSubmitForm = async (data: any) => {
    try {
      const payload = {
        url: "signup",
        body: data,
      };
      const resp = await signupAuthUser(payload).unwrap();
      console.log("resp", resp);
      if (resp?.code === signupUserCode) {
        dispatch(
          openAlert({
            type: "success",
            message: resp.message,
          })
        );
      }
    } catch (error: any) {
      console.log("error", error);
      if (error?.status === 400) {
        dispatch(
          openAlert({
            type: "success",
            message: error.data.error,
          })
        );
      }
    }
  };

  return (
    <>
      <Typography textAlign="center">User Signup</Typography>
      <form style={formContainer} onSubmit={handleSubmit(handleSubmitForm)}>
        <Box display="flex" flexDirection="column" gap="20px">
          <InputField
            type="text"
            register={register}
            id="firstName"
            name="firstName"
            placeholder="First Name"
            errorMessage={errors.firstName?.message}
          />
          <InputField
            type="text"
            register={register}
            id="lastName"
            name="lastName"
            placeholder="Last Name"
            errorMessage={errors.lastName?.message}
          />
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
  );
};

export default UserSignup;
