import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const SearchField = ({ searchText, setSearchText,placeholder }: any) => {
  return (
    <TextField
      size="small"
      value={searchText}
      onChange={(e: any) => setSearchText(e.target.value)}
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
