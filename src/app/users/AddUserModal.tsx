import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Divider } from "@mui/material";
import { modalCrossStyle, modalStyles } from "@/styles/styles";
import CloseIcon from "@mui/icons-material/Close";
import InputField from "@/components/resuseables/InputField";
import Buttons from "@/components/resuseables/Buttons";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addUserSchema } from "@/schema/schema";
import { db } from "@/firebaseConfig";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { useDispatch } from "react-redux";

interface AddUserModalInterface {
  open: boolean;
  userDetail: any;
  setOpenAddUserModal: (value: boolean) => void;
}

const AddUserModal = ({
  open,
  setOpenAddUserModal,
  userDetail,
}: AddUserModalInterface) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<any>({
    resolver: yupResolver(addUserSchema),
    defaultValues: userDetail,
  });

  console.log("isSubmitting", isSubmitting);

  const handleSubmitForm = async (data: any) => {
    const { firstName, lastName, email, designation } = data;
    console.log("data", data);
    if (userDetail.id) {
      if (
        firstName === userDetail.firstName &&
        lastName === userDetail.lastName &&
        email === userDetail.email &&
        designation === userDetail.designation
      )
        return;
      else {
        const userId = doc(db, "users", userDetail.id);
        await updateDoc(userId, data);
        dispatch(
          openAlert({
            type: "success",
            message: "User updated successfully!",
          })
        );
        setOpenAddUserModal(false);
      }
    } else {
      await setDoc(doc(db, "users", Date.now().toString(36)), {
        firstName,
        lastName,
        email,
        designation,
      });
      dispatch(
        openAlert({
          type: "success",
          message: "User added successfully!",
        })
      );
      setOpenAddUserModal(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpenAddUserModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyles}>
          <CloseIcon
            onClick={() => setOpenAddUserModal(false)}
            sx={modalCrossStyle}
          />
          <Typography variant="h5" padding="10px 20px">
            {userDetail.id ? "Update" : "Add"} User
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
                  onClick={() => setOpenAddUserModal(false)}
                  text="Cancel"
                />
                <Buttons
                  disabled={isSubmitting}
                  sx={{ textTransform: "capitalize" }}
                  variant="contained"
                  text={
                    userDetail.id && isSubmitting
                      ? "Updating..."
                      : userDetail.id
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
