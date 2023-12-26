import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Divider } from "@mui/material";
import { modalCrossStyle, modalStyles } from "@/styles/styles";
import CloseIcon from "@mui/icons-material/Close";
import InputField from "@/components/resuseables/InputField";
import Buttons from "@/components/resuseables/Buttons";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addUserSchema } from "@/schema/schema";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { useDispatch } from "react-redux";
import { useAddUserMutation, useUpdateUserMutation } from "@/redux/api/api";
import { addUserCode, updateUserCode } from "@/constants/constant";

interface AddUserModalInterface {
  open: boolean;
  userDetail: any;
  onClose: () => void;
}

const AddUserModal = ({ open, onClose, userDetail }: AddUserModalInterface) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<any>({
    resolver: yupResolver(addUserSchema),
    defaultValues: userDetail,
  });

  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleSubmitForm = async (data: any) => {
    const { firstName, lastName, email, designation } = data;
    try {
      if (userDetail._id) {
        if (
          firstName === userDetail.firstName &&
          lastName === userDetail.lastName &&
          email === userDetail.email &&
          designation === userDetail.designation
        )
          return;
        else {
          const payload = {
            url: "users",
            id: userDetail._id,
            body: data,
          };
          const resp = await updateUser(payload).unwrap();
          if (resp?.code === updateUserCode) {
            dispatch(
              openAlert({
                type: "success",
                message: resp.message,
              })
            );
            onClose();
          }
        }
      } else {
        const payload = {
          url: "users",
          body: data,
        };
        const resp = await addUser(payload).unwrap();
        if (resp?.code === addUserCode) {
          dispatch(
            openAlert({
              type: "success",
              message: resp.message,
            })
          );
          onClose();
        }
      }
    } catch (error: any) {
      dispatch(
        openAlert({
          type: "error",
          message: error?.data?.error,
        })
      );
      console.log("error", error);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyles}>
          <CloseIcon onClick={onClose} sx={modalCrossStyle} />
          <Typography variant="h5" padding="10px 20px">
            {userDetail._id ? "Update" : "Add"} User
          </Typography>
          <Divider />
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <Box
              display="flex"
              flexDirection="column"
              gap="20px"
              padding="20px"
            >
              <Box display="flex" justifyContent="space-between" gap="20px">
                <InputField
                  register={register}
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  label="First Name"
                  errorMessage={errors.firstName?.message}
                />
                <InputField
                  register={register}
                  type="text"
                  name="lastName"
                  label="Last Name"
                  placeholder="Last Name"
                  errorMessage={errors.lastName?.message}
                />
              </Box>
              <Box display="flex" justifyContent="space-between" gap="20px">
                <InputField
                  type="email"
                  register={register}
                  name="email"
                  label="Email"
                  placeholder="Email Address"
                  errorMessage={errors.email?.message}
                />
                <InputField
                  type="text"
                  register={register}
                  name="designation"
                  placeholder="Designation"
                  label="Designation"
                  errorMessage={errors.designation?.message}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap="20px"
                bottom="20px"
                position="absolute"
                right="20px"
              >
                <Buttons
                  color="error"
                  sx={{ textTransform: "capitalize" }}
                  variant="contained"
                  onClick={onClose}
                  text="Cancel"
                />
                <Buttons
                  disabled={isSubmitting}
                  sx={{ textTransform: "capitalize" }}
                  variant="contained"
                  text={
                    userDetail._id && isSubmitting
                      ? "Updating..."
                      : userDetail._id
                      ? "Update"
                      : isSubmitting
                      ? "Submitting..."
                      : "Submit"
                  }
                  type="submit"
                />
              </Box>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default AddUserModal;
