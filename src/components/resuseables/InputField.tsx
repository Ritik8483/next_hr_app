import {
  Box,
  TextField,
  TextFieldProps,
  TextFieldVariants,
  Typography,
} from "@mui/material";
import React from "react";
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from "react-hook-form";

type TInput = {
  variant?: TextFieldVariants | undefined;
  register?: UseFormRegister<any>;
  label?: string;
  errorMessage?: string | any;
  name?: string | undefined;
} & Omit<TextFieldProps, "variant">;

const InputField = (props: TInput) => {
  const { register, name, className, label, errorMessage, ...rest } = props;

  return (
    <Box width="100%" display="flex" flexDirection="column"  >
      <label style={{ fontSize: "12px", color: "var(--iconGrey)" }}>
        {label}
      </label>
      <TextField
        {...(register !== undefined
          ? {
              ...register(name ?? "", {
                required: true,
              }),
            }
          : null)}
        variant="outlined"
        {...rest}
        className={`${className}`}
      />
      <Typography marginTop="5px" fontSize="12px" color="red">
        {errorMessage || ""}
      </Typography>
    </Box>
  );
};

export default InputField;
