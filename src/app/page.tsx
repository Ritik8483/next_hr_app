// import Login from "./login/page";

// export default function Home() {
//   return <>
//   <Login/>
//   </>;
// }

"use client";

import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import { usePathname, useRouter } from "next/navigation";
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
import { redirect } from "next/navigation";

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
  const pathname:any = usePathname();
  const userToken = JSON.parse(localStorage.getItem("userToken") || "{}");
  const sidebarText = JSON.parse(localStorage.getItem("sidebarText") || "{}");
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
          localStorage.setItem("userToken", JSON.stringify(resp?.data?.token));
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

  useEffect(() => {
    if (Object.keys(userToken).length && pathname === "/") {
      redirect(sidebarText.toLowerCase())
    }
    else if(Object.keys(userToken).length && pathname !== "/"){
      redirect(pathname)
    }
  }, []);

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
    </>
  );
};

export default Login;