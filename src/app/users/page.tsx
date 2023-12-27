"use client";

import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Buttons from "@/components/resuseables/Buttons";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import AlertBox from "@/components/resuseables/AlertBox";
import AddUserModal from "./AddUserModal";
import NoDataFound from "@/components/resuseables/NoDataFound";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";
import PaginationTable from "@/components/resuseables/Pagination";
import useDebounce from "@/components/hooks/useDebounce";
import SearchField from "@/components/resuseables/SearchField";
import { StyledTableCell, StyledTableRow } from "@/styles/styles";
import { useRouter } from "next/navigation";
import { useDeleteUserMutation, useGetAllUsersQuery } from "@/redux/api/api";
import { deleteUserCode, limit } from "@/constants/constant";

const tableHeadings = [
  "S.No.",
  "First Name",
  "Last Name",
  "E-mail",
  "Designation",
  "Actions",
];

const Users = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [openAlertBox, setOpenAlertBox] = useState<any>({
    data: {},
    state: false,
  });
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState<string>("");
  const [userDetail, setUserDetail] = useState({});
  const debouncedValue = useDebounce(searchText, 500);

  const payload = {
    url: "users",
    page: currentPage,
    limit: limit,
    search: debouncedValue || "",
  };

  const { data, isLoading, error } = useGetAllUsersQuery(payload);
  const [deleteUser] = useDeleteUserMutation();

  const handleClose = (value: string) => {
    setOpenAlertBox({
      data: {},
      state: false,
    });
  };

  const handleAddUser = () => {
    setUserDetail({});
    setOpenAddUserModal(true);
  };

  const handleEdit = (item: any) => {
    setOpenAddUserModal(true);
    setUserDetail(item);
  };

  const handleDeleteUser = async () => {
    try {
      const payload = {
        url: "users",
        id: openAlertBox.data._id,
      };
      const resp = await deleteUser(payload).unwrap();
      if (resp?.code === deleteUserCode) {
        dispatch(
          openAlert({
            type: "success",
            message: resp.message,
          })
        );
        setOpenAlertBox(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleRowClick = (id: string) => {
    localStorage.setItem("generateId", JSON.stringify(`/users/${id}`));
    router.push(`/users/${id}`);
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="24px"
      >
        <SearchField
          setSearchText={setSearchText}
          searchText={searchText}
          placeholder="Search user by name/email"
        />
        <Buttons
          text="Add User"
          sx={{ textTransform: "capitalize" }}
          onClick={handleAddUser}
        />
      </Box>

      {!data?.data?.length || data === undefined ? (
        <NoDataFound text="No data Found" />
      ) : isLoading ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : data?.data?.length ? (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  {tableHeadings.map((item: string) => (
                    <StyledTableCell
                      align={
                        item === "S.No."
                          ? "left"
                          : item === "Actions"
                          ? "right"
                          : "center"
                      }
                      key={item}
                    >
                      {item}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data?.map((item: any, index: number) => (
                  <StyledTableRow
                    onClick={() => handleRowClick(item._id)}
                    key={item._id}
                  >
                    <StyledTableCell component="th" scope="row">
                      {currentPage === 1
                        ? index + 1
                        : limit * currentPage + 1 - limit + index}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.firstName}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.lastName}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.email}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.designation}
                    </StyledTableCell>

                    <StyledTableCell
                      align="right"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <Box
                        display="flex"
                        gap="15px"
                        justifyContent="flex-end"
                      >
                        <EditIcon
                          onClick={() => handleEdit(item)}
                          sx={{ cursor: "pointer", color: "var(--iconGrey)" }}
                        />
                        <DeleteIcon
                          onClick={() =>
                            setOpenAlertBox({ data: item, state: true })
                          }
                          sx={{ cursor: "pointer", color: "var(--iconGrey)" }}
                        />
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationTable
              totalCount={Math.ceil(data?.total / limit)}
              currentPage={currentPage}
              totalNumber={data?.total}
              setCurrentPage={setCurrentPage}
            />
          </TableContainer>
        </>
      ) : error ? (
        <NoDataFound text="Something went wrong" />
      ) : null}

      {openAlertBox && (
        <AlertBox
          open={openAlertBox.state}
          cancelText="No Cancel"
          confirmText="Yes Delete"
          mainHeaderText="Are you sure you want to delete"
          userName={openAlertBox.data.firstName}
          onClose={handleClose}
          handleClick={handleDeleteUser}
        />
      )}

      {openAddUserModal && (
        <AddUserModal
          open={openAddUserModal}
          onClose={() => setOpenAddUserModal(false)}
          userDetail={userDetail}
        />
      )}
    </>
  );
};

export default Users;
