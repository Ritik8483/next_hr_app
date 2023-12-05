"use client";

import React from "react";
import { Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { auth } from "../../firebaseConfig";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import InputField from "@/components/resuseables/InputField";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { loginSchema } from "@/schema/schema";
import { AppDispatch } from "@/redux/store";
import Buttons from "@/components/resuseables/Buttons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { formContainer } from "@/styles/styles";

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

  // const accessToken = useSelector((state: any) => state.authSlice.userToken);

  const handleSubmitForm = async (data: IFormInput) => {
    if (data?.email === "ritik.chauhan@quokkalabs.com") {
      try {
        // const reqObj = { auth, email: data.email, password: data.password };
        // const resp: any = await dispatch(signInWithEmail(reqObj)).unwrap();
        const resp: any = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        if (resp?.user?.accessToken) {
          localStorage.setItem("sidebarText", JSON.stringify("Dashboard"));
          localStorage.setItem("userFirebaseToken", JSON.stringify(resp?.user));
          dispatch(
            openAlert({
              type: "success",
              message: "User logged in successfully!",
            })
          );
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
        flexDirection="column"
        gap="20px"
        justifyContent="center"
        minHeight="100vh"
        width="100%"
      >
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
              text="Login"
            />
          </Box>
        </form>
      </Box>

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
