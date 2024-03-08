import { Skeleton } from "@mui/material";
import React from "react";

const SkeletonTable = (props: any) => {
  return (
    <>
      <Skeleton {...props} />
    </>
  );
};

export default SkeletonTable;
