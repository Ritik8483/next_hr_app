import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import snackbarSlice from "./slices/snackBarSlice";
import { api } from "./api/api";
// import api from "../redux/api";

const rootReducer = combineReducers({
  authSlice,
  snackbarSlice,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
