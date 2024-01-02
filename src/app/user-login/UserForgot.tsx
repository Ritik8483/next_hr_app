"use client";
import { Box, Typography } from "@mui/material";
import React from "react";
import { formContainer } from "@/styles/styles";
import InputField from "@/components/resuseables/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { userLoginSchema } from "@/schema/schema";
import Buttons from "@/components/resuseables/Buttons";
import { UserLoginPageInterface } from "@/interface/Interface";

const UserForgot = ({ settogglePage }: UserLoginPageInterface) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(userLoginSchema),
  });

  const handleForgotForm = () => {};
  return (
    <>
      <Typography textAlign="center">Forgot Password?</Typography>
      <form style={formContainer} onSubmit={handleSubmit(handleForgotForm)}>
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
  );
};

export default UserForgot;
