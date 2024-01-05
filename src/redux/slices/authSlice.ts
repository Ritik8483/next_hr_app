import type { Slice } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  userToken: string | null;
  sidebarOption: string;
}
const initialState: AuthState = {
  userToken: null,
  sidebarOption: "",
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
    clearLoginDetails: (state) => {
      state.userToken = null;
    },
  },
});

export const { storeLoginToken, clearLoginDetails, storeSidebarOption } =
  authSlice.actions;
export default authSlice.reducer;