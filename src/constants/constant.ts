const ETM = "Employees to Manager";
const MTE = "Manager to Employees";
const SA = "Self Assessment";

const limit = 10;

const addFeedbackParameterCode = 3000;
const updateFeedbackParameterCode = 3004;
const deleteFeedbackParameterCode = 3005;
const addUserCode = 3006;
const updateUserCode = 3009;
const deleteUserCode = 3010;
const addRoleCode = 3011;
const updateRoleCode = 3014;
const deleteRoleCode = 3015;
const addFeedbackFormCode = 3016;
const updateFeedbackFormCode = 3019;
const deleteFeedbackFormCode = 3020;
const loginUserCode = 4001;
const signupUserCode = 4002;

const tableHeadings = [
  "S.No.",
  "Feedback Type",
  "Feedback Name",
  "Feedback Description",
  "Actions",
];

export {
  ETM,
  MTE,
  SA,
  tableHeadings,
  limit,
  addFeedbackParameterCode,
  updateFeedbackParameterCode,
  deleteFeedbackParameterCode,
  addUserCode,
  updateUserCode,
  deleteUserCode,
  addRoleCode,
  updateRoleCode,
  deleteRoleCode,
  addFeedbackFormCode,
  updateFeedbackFormCode,
  deleteFeedbackFormCode,
  loginUserCode,
  signupUserCode,
};
