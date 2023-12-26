const ETM = "Employees to Manager";
const MTE = "Manager to Employees";

const limit = 10;

const addFeedbackParameterCode = 3000;
const updateFeedbackParameterCode = 3004;
const deleteFeedbackParameterCode = 3005;
const addUserCode = 3007;
const updateUserCode = 3009;
const deleteUserCode = 3010;
const addRoleCode = 3011;
const updateRoleCode = 3014;
const deleteRoleCode = 3015;

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
};
