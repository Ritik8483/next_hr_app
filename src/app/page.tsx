"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Login from "@/pages/Login";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import { useDispatch, useSelector } from "react-redux";
import { Alert } from "@mui/material";
import { closeAlert } from "@/redux/slices/snackBarSlice";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function Home() {
  const dispatch = useDispatch();
  const snackbar = useSelector((state: any) => state.snackbarSlice);
  const accessToken = useSelector((state: any) => state.authSlice.userToken);

  useEffect(() => {
    if (accessToken) redirect("/home");
    else redirect("/login");
  }, []);
  console.log("snackbar", snackbar);

  return (
    <>
      {/* <Login /> */}
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
}

//type of e in submiiting form FormEvent<HTMLFormElement>
//To set-up redux only use https://redux.js.org/introduction/getting-started
//for setting up store https://redux-toolkit.js.org/usage/usage-guide (Usage Guide)
