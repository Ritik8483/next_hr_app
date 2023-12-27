import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8080/" }),
  tagTypes: ["FeedbackParameter", "Users", "Roles", "GenerateForm"],
  endpoints: (builder) => ({
    getAllFeedbackParameters: builder.query({
      query: (data) => ({
        url: data.page
          ? `${data.url}?page=${data.page}&limit=${data.limit}&search=${data.search}`
          : data.search
          ? `${data.url}?search=${data.search}`
          : data.url,
      }),
      providesTags: ["FeedbackParameter"],
    }),

    addFeedbackParameter: builder.mutation({
      query: (data) => ({
        url: data.url,
        method: "POST",
        body: data.body,
      }),
      invalidatesTags: ["FeedbackParameter"],
    }),

    updateFeedbackParameter: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "PATCH",
        body: data.body,
      }),
      invalidatesTags: ["FeedbackParameter"],
    }),

    deleteFeedbackParameter: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FeedbackParameter"],
    }),

    getAllUsers: builder.query({
      query: (data) => ({
        url: data.page
          ? `${data.url}?page=${data.page}&limit=${data.limit}&search=${data.search}`
          : `${data.url}?search=${data.search}`,
      }),
      providesTags: ["Users"],
    }),

    addUser: builder.mutation({
      query: (data) => ({
        url: data.url,
        method: "POST",
        body: data.body,
      }),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "PATCH",
        body: data.body,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    getAllRoles: builder.query<any, any>({
      query: (data) => ({
        url: data.page
          ? `${data.url}?page=${data.page}&limit=${data.limit}&search=${data.search}`
          : `${data.url}?search=${data.search}`,
      }),
      providesTags: ["Roles"],
    }),

    addRole: builder.mutation({
      query: (data) => ({
        url: data.url,
        method: "POST",
        body: data.body,
      }),
      invalidatesTags: ["Roles"],
    }),

    updateRole: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "PATCH",
        body: data.body,
      }),
      invalidatesTags: ["Roles"],
    }),

    deleteRole: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),

    getAllGenerateFeedbackForm: builder.query({
      query: (data) => ({
        url: data.page
          ? `${data.url}?page=${data.page}&limit=${data.limit}&search=${data.search}`
          : `${data.url}?search=${data.search}`,
      }),
      providesTags: ["GenerateForm"],
    }),

    getSingleFeedbackFormDetail: builder.query({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
      }),
      providesTags: ["GenerateForm"],
    }),

    addGenerateFeedbackForm: builder.mutation({
      query: (data) => ({
        url: data.url,
        method: "POST",
        body: data.body,
      }),
      invalidatesTags: ["GenerateForm"],
    }),

    updateFeedbackForm: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "PATCH",
        body: data.body,
      }),
      invalidatesTags: ["GenerateForm"],
    }),

    deleteFeedbackForm: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GenerateForm"],
    }),
  }),
});

export const {
  useGetAllFeedbackParametersQuery,
  useAddFeedbackParameterMutation,
  useUpdateFeedbackParameterMutation,
  useDeleteFeedbackParameterMutation,
  useGetAllUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAllRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetAllGenerateFeedbackFormQuery,
  useGetSingleFeedbackFormDetailQuery,
  useAddGenerateFeedbackFormMutation,
  useUpdateFeedbackFormMutation,
  useDeleteFeedbackFormMutation,
} = api;

//DOCS
//https://redux-toolkit.js.org/tutorials/rtk-query
// https://redux-toolkit.js.org/rtk-query/api/createApi  --- Create API
// https://redux-toolkit.js.org/rtk-query/api/created-api/redux-integration --- Redux Integeration AND store
// https://redux-toolkit.js.org/rtk-query/usage/automated-refetching#providing-tags --tags
