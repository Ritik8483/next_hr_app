import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers, { getState }: any) => {
    const token = getState().authSlice.userToken;
    if (token) {
      headers.set("Authorization", token);
    }
  },
});
