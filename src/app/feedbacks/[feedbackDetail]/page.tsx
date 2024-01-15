"use client";

import Breadcrumb from "@/components/resuseables/Breadcrumb";
import { useRouter } from "next/navigation";
import React from "react";

const FeedbackDetail = () => {
  const router = useRouter();
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
