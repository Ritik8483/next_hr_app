import { Box, TextField, Typography } from "@mui/material";
import React, { ComponentProps } from "react";
type TInput = {
  variant: "outline" | "contained";
} & ComponentProps<"input">;

const InputField = (props: any) => {
  const { register, name, className, errorMessage, ...rest } = props;
  console.log("rest", rest);

  return (
    <Box>
      <TextField
        {...register(name, {
          required: true,
        })}
        variant="outlined"
        {...rest}
        className={`${className}`}
      />
      <Typography marginTop="5px" fontSize="12px" color="red">{errorMessage}</Typography>
    </Box>
  );
};

export default InputField;
