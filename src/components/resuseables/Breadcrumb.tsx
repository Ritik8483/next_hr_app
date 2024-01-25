import { Breadcrumbs, Typography } from "@mui/material";
import React from "react";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { BreadCrumbInterface } from "@/interface/Interface";

const Breadcrumb = ({
  onClick,
  textFirst,
  textSecond,
}: BreadCrumbInterface) => {
  const breadcrumbs = [
    <Typography
      sx={{ cursor: "pointer" }}
      onClick={onClick}
      key="3"
      color="var(--primaryThemeBlue)"
    >
      {textFirst}
    </Typography>,
    <Typography sx={{ cursor: "pointer" }} color="var(--primaryThemeBlue)">
      {textSecond}
    </Typography>,
  ];

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
    >
      {breadcrumbs}
    </Breadcrumbs>
  );
};

export default Breadcrumb;
