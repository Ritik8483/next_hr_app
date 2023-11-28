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
import { userLoginSchema } from "@/schema/schema";
import { AppDispatch } from "@/redux/store";
import Buttons from "@/components/resuseables/Buttons";
import { sendSignInLinkToEmail } from "firebase/auth";

interface IFormInput {
  email: string;
}

const UserLogin = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(userLoginSchema),
  });

  const router = useRouter();
  const snackbar = useSelector((state: any) => state.snackbarSlice);
  const dispatch: AppDispatch = useDispatch();

  const handleSubmitForm = async (data: IFormInput) => {
    console.log("data", data);

    try {
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: "http://localhost:3000/form",
        // This must be true.
        handleCodeInApp: true,
        // iOS: {
        //   bundleId: "com.example.ios",
        // },
        // android: {
        //   packageName: "com.example.android",
        //   installApp: true,
        //   minimumVersion: "12",
        // },
        dynamicLinkDomain: "https://link.example.com/?link=https://example.com/my-resource",
      };
      const resp = sendSignInLinkToEmail(auth, data.email, actionCodeSettings)
        .then((response: any) => {
          // The link was successfully sent. Inform the user.
          // Save the email locally so you don't need to ask the user for it again
          // if they open the link on the same device.
          // window.localStorage.setItem("emailForSignIn", data.email);
          console.log("response", response);

          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ...
        });
      console.log("resp", resp);
    } catch (error) {
      console.log("error", error);
    }

    // try {
    //   const reqObj = { auth, email: data.email, password: data.password };
    //   const resp: any = await dispatch(signInWithEmail(reqObj)).unwrap();
    //   if (resp?.user?.accessToken) {
    //     router.push("/dashboard");
    //     dispatch(
    //       openAlert({
    //         type: "success",
    //         message: "User logged in successfully!",
    //       })
    //     );
    //   }
    // } catch (error) {
    //   dispatch(
    //     openAlert({
    //       type: "error",
    //       message: "Invalid login credentials",
    //     })
    //   );
    //   console.log("error", error);
    // }
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
        <Typography textAlign="center">User Login</Typography>
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

export default UserLogin;
