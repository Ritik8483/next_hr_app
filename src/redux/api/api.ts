import { baseQuery } from "@/app/global";
import { createApi } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: ["Generate", "Parameters", "Users", "Roles"],
  endpoints: (builder) => ({
    loginAdminUser: builder.mutation({
      query: (data) => ({
        url: data.url,
        method: "POST",
        body: data.body,
      }),
    }),

    getAllFeedbackParameters: builder.query({
      query: (data) => ({
        url: data.page
          ? `${data.url}?page=${data.page}&limit=${data.limit}&search=${data.search || ""}`
          : data.search
          ? `${data.url}?search=${data.search || ""}`
          : data.url,
      }),
      providesTags: ["Parameters"],
    }),

    addFeedbackParameter: builder.mutation({
      query: (data) => ({
        url: data.url,
        method: "POST",
        body: data.body,
      }),
      invalidatesTags: ["Parameters"],
    }),

    updateFeedbackParameter: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "PATCH",
        body: data.body,
      }),
      invalidatesTags: ["Parameters"],
    }),

    deleteFeedbackParameter: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Parameters"],
    }),

    getAllUsers: builder.query({
      query: (data) => ({
        url: data.page
          ? `${data.url}?page=${data.page}&limit=${data.limit}&search=${data.search || ""}`
          : `${data.url}?search=${data.search || ""}`,
      }),
      providesTags: ["Users"],
    }),

    
    getSingleUser: builder.query({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
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
          ? `${data.url}?page=${data.page}&limit=${data.limit}&search=${data.search || ""}`
          : `${data.url}?search=${data.search || ""}`,
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

    addGenerateFeedbackForm: builder.mutation({
      query: (data) => ({
        url: data.url,
        method: "POST",
        body: data.body,
      }),
      invalidatesTags: ["Generate"],
    }),
    
    getAllGenerateFeedbackForm: builder.query({
      query: (data) => ({
        url: data.page
          ? `${data.url}?page=${data.page}&limit=${data.limit}&search=${data.search || ""}`
          : `${data.url}?search=${data.search || ""}`,
      }),
      providesTags: ["Generate"],
    }),

    getSingleFeedbackFormDetail: builder.query({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
      }),
      providesTags: ["Generate"],
    }),

    updateFeedbackForm: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "PATCH",
        body: data.body,
      }),
      invalidatesTags: ["Generate"],
    }),

    deleteFeedbackForm: builder.mutation({
      query: (data) => ({
        url: `${data.url}/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Generate"],
    }),

    sendEmail: builder.mutation({
      query: (data) => ({
        url: data.url,
        method: "POST",
        body: data.body,
      }),
    }),

  }),
});

export const {
  useLoginAdminUserMutation,
  useGetAllFeedbackParametersQuery,
  useAddFeedbackParameterMutation,
  useUpdateFeedbackParameterMutation,
  useDeleteFeedbackParameterMutation,
  useGetAllUsersQuery,
  useGetSingleUserQuery,
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
  useSendEmailMutation
} = api;
