import React from "react";
import { Typography, Box } from "@mui/material";

const NoDataFound = ({ text, height }: any) => {
  return (
    <Box
      width="100%"
      height={height ? height : "calc(100vh - 180px)"}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant="h5">{text}</Typography>
    </Box>
  );
};

export default NoDataFound;
