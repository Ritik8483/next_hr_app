import { signInWithEmailAndPassword } from "firebase/auth/cordova";
import type { Slice } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const signInWithEmail = createAsyncThunk(
  "auth/signInWithEmail", //action type
  async ({
    auth,
    email,
    password,
  }: {
    auth: any;
    email: string;
    password: string;
  }) => {
    const response = await signInWithEmailAndPassword(auth, email, password);
    return response;
  }
);

export interface AuthState {
  userToken: string | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: any;
  sidebarOption: string;
}
const initialState: AuthState = {
  userToken: null,
  loading: "idle",
  error: null,
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
      state.userToken = "idle";
      state.userToken = null;
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(signInWithEmail.pending, (state: any, action: any) => {
        if (state.loading === "idle") {
          state.loading = "pending";
        }
      })
      .addCase(signInWithEmail.fulfilled, (state: any, action: any) => {
        if (state.loading === "pending") state.loading = "idle";
        state.userToken = action.payload.user.accessToken;
      })
      .addCase(signInWithEmail.rejected, (state: any, action: any) => {
        if (state.loading === "pending") {
          state.loading = "idle";
          state.error = action.error;
        }
      });
  },
});

export const { storeLoginToken, clearLoginDetails,storeSidebarOption } = authSlice.actions;
export default authSlice.reducer;

//API CALLING WITH CREATE THUnK

// import type { Slice } from "@reduxjs/toolkit";
// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// const userAPI = {
//   fetchById: async (userId: number) => {
//     const response = await fetch(
//       `https://jsonplaceholder.typicode.com/todos/${userId}`
//     );
//     return response.json();
//   },
// };

// export const fetchUserById: any = createAsyncThunk(
//   "todos/fetchByIdStatus",
//   async (userId: number) => {
//     const response = await userAPI.fetchById(userId);
//     console.log("response", response);

//     return response;
//   }
// );

// export interface AuthState {
//   userToken: string | null;
//   entities: any;
//   loading: "idle" | "pending" | "succeeded" | "failed";
//   error: any;
// }
// const initialState: AuthState = {
//   userToken: null,
//   entities: {},
//   loading: "idle",
//   error: null,
// };

// const authSlice: Slice = createSlice({
//   name: "authReducer",
//   initialState,
//   reducers: {
//     storeLoginToken: (state, { payload }) => {
//       state.userToken = payload;
//     },
//   },
//   extraReducers: (builder: any) => {
//     // Add reducers for additional action types here, and handle loading state as needed
//     builder
//       .addCase(fetchUserById.pending, (state: any, action: any) => {
//         if (state.loading === "idle") {
//           state.loading = "pending";
//         }
//       })
//       .addCase(fetchUserById.fulfilled, (state: any, action: any) => {
//         console.log("action", action);
//         console.log("state", state);

//         // Add user to the state array
//         state.loading = "idle";
//         state.entities = action.payload;
//       })
//       .addCase(fetchUserById.rejected, (state: any, action: any) => {
//         if (state.loading === "pending") {
//           state.loading = "idle";
//           state.error = action.error;
//         }
//       });
//   },
// });

// console.log("authSlice", authSlice);

// export const { storeLoginToken } = authSlice.actions;
// export default authSlice.reducer;

//SIMPLE STATE MANAGEMENT

// import type { Slice } from "@reduxjs/toolkit";
// import { createSlice } from "@reduxjs/toolkit";

// export interface AuthState {
//   userToken: string | null;
// }
// const initialState: AuthState = {
//   userToken: null,
// };

// const authSlice: Slice = createSlice({
//   name: "authReducer",
//   initialState,
//   reducers: {
//     storeLoginToken: (state, { payload }) => {
//       state.userToken = payload;
//     },
//   },
// });
// console.log("authSlice", authSlice);

// export const { storeLoginToken } = authSlice.actions;
// export default authSlice.reducer;
