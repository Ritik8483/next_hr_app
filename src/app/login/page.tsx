"use client";

import React from "react";
import { Alert, Box, Snackbar } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { auth } from "../../firebaseConfig";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import InputField from "@/components/resuseables/InputField";
import { closeAlert, openAlert } from "@/redux/slices/snackBarSlice";
import { loginSchema } from "@/schema/schema";
import { AppDispatch } from "@/redux/store";
import Buttons from "@/components/resuseables/Buttons";
import { formContainer } from "@/styles/styles";
import { IFormInput } from "@/interface/Interface";
import { useLoginAdminUserMutation } from "@/redux/api/api";
import { storeLoginToken } from "@/redux/slices/authSlice";

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(loginSchema),
  });

  const router = useRouter();
  const snackbar = useSelector((state: any) => state.snackbarSlice);
  const dispatch: AppDispatch = useDispatch();

  const [loginAdminUser] = useLoginAdminUserMutation();

  const handleSubmitForm = async (data: IFormInput) => {
    if (data?.email === "ritik.chauhan@quokkalabs.com") {
      try {
        const payload = {
          url: "auth/login",
          body: data,
        };
        const resp = await loginAdminUser(payload).unwrap();
        if (resp?.data?.token) {
          dispatch(storeLoginToken(resp?.data?.token));
          localStorage.setItem("sidebarText", JSON.stringify("Dashboard"));
          localStorage.setItem(
            "userFirebaseToken",
            JSON.stringify({ ...data, token: resp?.data?.token })
          );
          dispatch(
            openAlert({
              type: "success",
              message: resp.message,
            })
          );
          reset();
          router.push("/dashboard");
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
    } else {
      dispatch(
        openAlert({
          type: "error",
          message: "Please enter correct user email address",
        })
      );
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Box>
          <Typography textAlign="center">QL Feedback App</Typography>
          <form style={formContainer} onSubmit={handleSubmit(handleSubmitForm)}>
            <Box display="flex" flexDirection="column" gap="20px">
              <InputField
                type="email"
                register={register}
                id="email"
                name="email" //name is essentially required
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
              <Buttons
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                text={isSubmitting ? "Login..." : "Login"}
              />
            </Box>
          </form>
        </Box>
      </Box>

      {snackbar.snackbarState && (
        <Snackbar
          open={snackbar.snackbarState}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          autoHideDuration={1500}
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

export default Login;
