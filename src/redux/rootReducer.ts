import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import snackbarSlice from "./slices/snackBarSlice";

const rootReducer = combineReducers({
  authSlice,
  snackbarSlice
});

export default rootReducer;
