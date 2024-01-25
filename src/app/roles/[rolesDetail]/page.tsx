"use client";

import Breadcrumb from '@/components/resuseables/Breadcrumb'
import { useRouter } from 'next/navigation';
import React from 'react'

const RoleDetail = () => {
  const router = useRouter();
  return (
    <>
      <Breadcrumb
        onClick={() => router.push("/roles")}
        textFirst="Roles"
        textSecond="RoleDetail"
      />
    </>
  )
}

export default RoleDetail
