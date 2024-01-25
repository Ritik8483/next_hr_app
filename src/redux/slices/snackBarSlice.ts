import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  snackbarState: false,
  snackbarMessage: "",
  snackbarType: "",
};

const snackbarSlice = createSlice({
  name: "snackbarSlice",
  initialState,
  reducers: {
    openAlert(state, action) {
      state.snackbarState = true;
      state.snackbarMessage = action.payload.message;
      state.snackbarType = action.payload.type;
    },
    closeAlert(state, action) {
      state.snackbarState = false;
      state.snackbarMessage = "";
      state.snackbarType = "";
    },
  },
});

const { actions, reducer } = snackbarSlice;
export const { openAlert, closeAlert } = actions;
export default reducer;
