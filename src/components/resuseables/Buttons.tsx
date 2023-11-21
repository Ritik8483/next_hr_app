import {
  Button,
  ButtonProps,
  ButtonTypeMap,
  ExtendButtonBase,
} from "@mui/material";
import React, { ComponentProps } from "react";

type TCustomButton = ButtonProps & {
  text: string | undefined;
} & ComponentProps<"button">;

const Buttons = (props: TCustomButton) => {
  const { text, sx, variant, ...rest } = props;
  return (
    <>
      <Button
        {...rest}
        variant={variant || "contained"}
        sx={{ ...sx, textTransform: "capitalize" }}
      >
        {text}
      </Button>
    </>
  );
};

export default Buttons;
