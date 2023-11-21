"use client";

import React from "react";
import { Box } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";
import { closeAlert } from "@/redux/slices/snackBarSlice";
import styles from "../../pages/Login.module.css";
import { useSelector, useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { auth } from "../../firebaseConfig";
import { signInWithEmail } from "@/redux/slices/authSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import InputField from "@/components/resuseables/InputField";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { loginSchema } from "@/schema/schema";
import { AppDispatch } from "@/redux/store";
import Buttons from "@/components/resuseables/Buttons";

interface IFormInput {
  email: string;
  password: string;
}

const Login = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(loginSchema),
  });

  const router = useRouter();
  const snackbar = useSelector((state: any) => state.snackbarSlice);
  const dispatch: AppDispatch = useDispatch();

  const accessToken = useSelector((state: any) => state.authSlice.userToken);

  const handleSubmitForm = async (data: IFormInput) => {
    try {
      const reqObj = { auth, email: data.email, password: data.password };
      const resp: any = await dispatch(signInWithEmail(reqObj)).unwrap();
      if (resp?.user?.accessToken) {
        router.push("/dashboard");
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
              text="Login"
            />
          </Box>
        </form>
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

// FOR CALLING API WITH THUNK
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
