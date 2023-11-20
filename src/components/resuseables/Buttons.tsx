import { Button } from "@mui/material";
import React from "react";

const btnStyle = {
  textTransform: "capitalize"
};
const Buttons = (props: any) => {
  const { text, sx, variant, ...rest } = props;
  return (
    <>
      <Button
        {...rest}
        variant={variant || "contained"}
        sx={{ ...sx, ...btnStyle }}
      >
        {text}
      </Button>
    </>
  );
};

export default Buttons;
