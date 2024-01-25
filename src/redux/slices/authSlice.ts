import type { Slice } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  userToken: string | null;
  sidebarOption: string;
  feedbackSwitch: boolean;
}
const initialState: AuthState = {
  userToken: null,
  sidebarOption: "",
  feedbackSwitch: false,
};

const authSlice: Slice = createSlice({
  name: "authReducer",
  initialState,
  reducers: {
    storeLoginToken: (state, { payload }) => {
      state.userToken = payload;
    },
    storeSidebarOption(state, action) {
      state.sidebarOption = action.payload;
    },
    setFeedbackSwitch: (state, { payload }) => {
      state.feedbackSwitch = payload;
    },
    clearLoginDetails: (state) => {
      state.userToken = null;
    },
  },
});

export const { storeLoginToken, clearLoginDetails, storeSidebarOption,setFeedbackSwitch } =
  authSlice.actions;
export default authSlice.reducer;
