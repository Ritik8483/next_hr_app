"use client";

import React from "react";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { closeAlert } from "@/redux/slices/snackBarSlice";
import { storeLoginToken } from "@/redux/slices/authSlice";

const Home = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    router.push("/");
    dispatch(
      closeAlert({
        message: "",
        type: "",
      })
    );
    dispatch(storeLoginToken(null));
  };
  return (
    <div>
      Home
      <Button variant="contained" onClick={handleLogout}>
        Back
      </Button>
    </div>
  );
};

export default Home;
