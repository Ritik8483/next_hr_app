import React, { ChangeEvent } from "react";
import TextField, {
  TextFieldProps,
  TextFieldVariants,
} from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

type TInput = {
  searchText?: string | undefined;
  setSearchText?: any;
  onKeyDown?:any
} & Omit<TextFieldProps, "variant">;

const SearchField = ({ searchText, setSearchText, placeholder,onKeyDown }: TInput) => {
  return (
    <TextField
      size="small"
      onKeyDown={onKeyDown}
      value={searchText}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        setSearchText(e.target.value)
      }
      placeholder={placeholder}
      defaultValue=""
      type="text"
      sx={{ width: "400px" }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchField;
