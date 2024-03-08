"use client";

import Breadcrumb from "@/components/resuseables/Breadcrumb";
import { useRouter } from "next/navigation";
import React from "react";

const UserDetail = () => {
  const router = useRouter();
  return (
    <>
      <Breadcrumb
        onClick={() => router.push("/users")}
        textFirst="Users"
        textSecond="User Detail"
      />
    </>
  );
};

export default UserDetail;
