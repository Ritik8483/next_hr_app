import { Box, TextField, Typography } from "@mui/material";
import React, { ComponentProps } from "react";
type TInput = {
  variant: "outline" | "contained";
} & ComponentProps<"input">;

const InputField = (props: any) => {
  const { register, name, className, label, errorMessage, ...rest } = props;

  return (
    <Box width="100%">
      <label style={{ fontSize: "12px", color: "var(--iconGrey)" }}>
        {label}
      </label>
      <TextField
        {...(register !== undefined
          ? {
              ...register(name, {
                required: true,
              }),
            }
          : null)}
        variant="outlined"
        {...rest}
        className={`${className}`}
      />
      <Typography marginTop="5px" fontSize="12px" color="red">
        {errorMessage}
      </Typography>
    </Box>
  );
};

export default InputField;
