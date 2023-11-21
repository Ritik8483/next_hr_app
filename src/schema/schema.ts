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

export { loginSchema, addUserSchema ,addRolesSchema};
