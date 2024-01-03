"use client";

import { Box, Typography } from "@mui/material";
import React from "react";
import { formContainer } from "@/styles/styles";
import InputField from "@/components/resuseables/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { userLoginSchema } from "@/schema/schema";
import Buttons from "@/components/resuseables/Buttons";
import { IFormInput, UserLoginPageInterface } from "@/interface/Interface";
import { useGetAllUsersQuery, useLoginAuthUserMutation } from "@/redux/api/api";
import { loginUserCode } from "@/constants/constant";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { useDispatch } from "react-redux";
import { storeUsersLoginToken } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const UserLogin = ({ settogglePage }: UserLoginPageInterface) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const paramsId = params?.get("id");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(userLoginSchema),
  });

  const payload = {
    url: "users",
  };

  const { data } = useGetAllUsersQuery(payload, {
    refetchOnMountOrArgChange: true,
  });

  console.log("data", data);

  const [loginAuthUser] = useLoginAuthUserMutation();

  const handleLoginForm = async (inputData: any) => {
    console.log("inputData", inputData);

    const filteredUser = data?.data?.filter(
      (item: any) => item.email === inputData?.email
    );
    console.log("filteredUser", filteredUser);

    try {
      const payload = {
        url: "login",
        body: inputData,
      };
      const resp = await loginAuthUser(payload).unwrap();
      console.log("resp", resp);
      if (resp?.code === loginUserCode) {
        dispatch(
          openAlert({
            type: "success",
            message: resp.message,
          })
        );
        dispatch(storeUsersLoginToken(filteredUser[0]));
        router.push(`/form?id=${paramsId}`);
        reset();
      }
    } catch (error: any) {
      console.log("error", error);
      if (error?.originalStatus === 401) {
        dispatch(
          openAlert({
            type: "success",
            message: error.error,
          })
        );
      }
    }
  };

  return (
    <>
      <Typography textAlign="center">User Login</Typography>
      <form style={formContainer} onSubmit={handleSubmit(handleLoginForm)}>
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
  );
};

export default UserLogin;
