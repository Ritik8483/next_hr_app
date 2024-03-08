import * as yup from "yup";

const loginSchema = yup
  .object({
    email: yup.string().required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  })
  .required();

const userLoginSchema = yup
  .object({
    email: yup.string().required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  })
  .required();

const userSignupSchema = yup
  .object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  })
  .required();

const userForgotPasswordSchema = yup
  .object({
    email: yup.string().required("Email is required"),
  })
  .required();

const addUserSchema = yup
  .object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required"),
    designation: yup.string().required("Designation is required"),
  })
  .required();

const addRolesSchema = yup
  .object({
    teamName: yup.string().required("Team name is required"),
    teamEmail: yup.string().required("Team email is required"),
  })
  .required();

const addFeedbacksSchema = yup
  .object({
    feedbackName: yup.string().required("Feedback name is required"),
    feedbackDescription: yup.string(),
  })
  .required();

const addFeedbacksMCQSchema = yup
  .object({
    feedbackName: yup.string().required("Feedback name is required"),
  })
  .required();

const generateFeedbackSchema = yup
  .object({
    feedbackName: yup.string().required("Feedback name is required"),
    feedbackDescription: yup
      .string()
      .required("Feedback description is required"),
  })
  .required();

export {
  loginSchema,
  userLoginSchema,
  userSignupSchema,
  addUserSchema,
  addRolesSchema,
  addFeedbacksSchema,
  addFeedbacksMCQSchema,
  generateFeedbackSchema,
  userForgotPasswordSchema,
};
