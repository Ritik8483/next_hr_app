import * as yup from "yup";

const loginSchema = yup
  .object({
    email: yup.string().required("Email is required"),
    password: yup.string().min(8).required("Password is required"),
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

export { loginSchema, addUserSchema };
