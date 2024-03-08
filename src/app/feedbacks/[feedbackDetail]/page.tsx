"use client";

import Breadcrumb from "@/components/resuseables/Breadcrumb";
import { useRouter } from "next/navigation";
import React from "react";
import { useSelector } from "react-redux";

const FeedbackDetail = () => {
  const router = useRouter();
  const feedbackSwitch = useSelector(
    (state: any) => state.authSlice.feedbackSwitch
  );

  return (
    <>
      <Breadcrumb
        onClick={() => router.push("/feedbacks")}
        textFirst="Feedbacks"
        textSecond="FeedbackDetail"
      />
    </>
  );
};

export default FeedbackDetail;
