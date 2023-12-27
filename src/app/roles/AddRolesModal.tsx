"use client";

import React, { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import { modalCrossStyle, modalStyles } from "@/styles/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { Divider, InputLabel } from "@mui/material";
import InputField from "@/components/resuseables/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addRolesSchema } from "@/schema/schema";
import Buttons from "@/components/resuseables/Buttons";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";
import {
  useAddRoleMutation,
  useGetAllUsersQuery,
  useUpdateRoleMutation,
} from "@/redux/api/api";
import { addRoleCode, updateRoleCode } from "@/constants/constant";

const ITEM_HEIGHT = 48;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 250,
    },
  },
};

interface AddRolesModalInterface {
  openRolesModal: boolean;
  onClose: () => void;
  rolesDetail: any;
}

const AddRolesModal = (props: AddRolesModalInterface) => {
  const dispatch = useDispatch();
  const { openRolesModal, rolesDetail, onClose } = props;
  const [personName, setPersonName] = useState<any>(
    rolesDetail?._id ? rolesDetail?.teamUsers : []
  );
  const [usersList, setUsersList] = useState([]);
  const [validateUsers, setValidateUsers] = useState(false);

  const payload = {
    url: "users",
  };

  const { data } = useGetAllUsersQuery(payload);
  const [addRole] = useAddRoleMutation();
  const [updateRole] = useUpdateRoleMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<any>({
    resolver: yupResolver(addRolesSchema),
    defaultValues: rolesDetail,
  });

  const handleSubmitForm = async (data: any) => {
    if (!personName.length) return;
    setValidateUsers(false);
    try {
      if (rolesDetail._id) {
        const payload = {
          url: "roles",
          id: rolesDetail._id,
          body: { ...data, teamUsers: personName.map((it: any) => it._id) },
        };
        const resp = await updateRole(payload).unwrap();
        if (resp?.code === updateRoleCode) {
          dispatch(
            openAlert({
              type: "success",
              message: resp.message,
            })
          );
          onClose();
        }
      } else {
        const payload = {
          url: "roles",
          body: { ...data, teamUsers: personName.map((it: any) => it._id) },
        };

        console.log("payload", payload);

        const resp = await addRole(payload).unwrap();
        if (resp?.code === addRoleCode) {
          dispatch(
            openAlert({
              type: "success",
              message: resp.message,
            })
          );
          onClose();
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleValidateUsers = () => {
    if (personName.length) {
      setValidateUsers(false);
    } else {
      setValidateUsers(true);
    }
  };

  const handleCheckBoxes = (item: any) => {
    const personNames: any = [...personName];
    const indexOfItem = personNames.findIndex((it: any) => it._id === item._id);

    if (indexOfItem !== -1) {
      personNames.splice(indexOfItem, 1);
    } else {
      personNames.push(item);
    }
    setPersonName(personNames);
    if (personNames.length) setValidateUsers(false);
    else setValidateUsers(true);
  };

  console.log("personNames", personName);

  const userIds = personName?.map((it: any) => it._id);

  return (
    <Modal
      open={openRolesModal}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyles}>
        <CloseIcon onClick={onClose} sx={modalCrossStyle} />
        <Typography variant="h5" padding="10px 20px">
          {rolesDetail._id ? "Update" : "Add"} Roles
        </Typography>
        <Divider />
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Box display="flex" flexDirection="column" gap="20px" padding="20px">
            <InputField
              register={register}
              type="text"
              name="teamName"
              placeholder="Enter team name"
              label="Team Name"
              errorMessage={errors.teamName?.message}
            />
            <InputField
              register={register}
              type="email"
              name="teamEmail"
              placeholder="Enter team name"
              label="Team Email"
              errorMessage={errors.teamEmail?.message}
            />
            <Box>
              <InputLabel sx={{ fontSize: "12px", color: "var(--iconGrey)" }}>
                Select Person
              </InputLabel>
              <Select
                id="demo-multiple-checkbox"
                multiple
                sx={{ width: "100%" }}
                value={personName}
                input={<OutlinedInput />}
                renderValue={(selected: any) => {
                  console.log("selected", selected);
                  if (selected.length === 0) {
                    return <>Select Person</>;
                  }
                  const firstNames = selected?.map(
                    (it: any) => it.firstName + " " + it.lastName
                  );

                  return firstNames.join(", ");
                }}
                displayEmpty
                MenuProps={MenuProps}
              >
                {data?.data?.map((item: any, index: number) => {
                  return (
                    <MenuItem
                      onClick={() => handleCheckBoxes(item)}
                      key={item._id}
                      value={item}
                    >
                      <Checkbox
                        defaultChecked={userIds?.includes(item._id)}
                        checked={userIds?.includes(item._id)}
                      />
                      <ListItemText
                        primary={
                          item.firstName +
                          " " +
                          item.lastName +
                          " " +
                          "(" +
                          item.designation +
                          ")"
                        }
                      />
                    </MenuItem>
                  );
                })}
              </Select>
              {validateUsers && (
                <Typography
                  sx={{ fontSize: "12px", color: "red", marginTop: "5px" }}
                >
                  Please select a user
                </Typography>
              )}
            </Box>
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
                rolesDetail._id && isSubmitting
                  ? "Updating..."
                  : rolesDetail._id
                  ? "Update"
                  : isSubmitting
                  ? "Submitting..."
                  : "Submit"
              }
              onClick={() => handleValidateUsers()}
              type="submit"
            />
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddRolesModal;
