"use client";

import React, { useState } from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import SearchField from "@/components/resuseables/SearchField";
import Buttons from "@/components/resuseables/Buttons";
import AddRolesModal from "./AddRolesModal";
import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { StyledTableCell, StyledTableRow } from "@/styles/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaginationTable from "@/components/resuseables/Pagination";
import useDebounce from "@/components/hooks/useDebounce";
import AlertBox from "@/components/resuseables/AlertBox";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useDeleteRoleMutation, useGetAllRolesQuery } from "@/redux/api/api";
import { deleteRoleCode, limit } from "@/constants/constant";

const tableHeadings = ["S.No.", "Team Name", "Team email", "Users", "Actions"];

const Roles = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>("");
  const [openRolesModal, setOpenRolesModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolesDetail, setRolesDetail] = useState({});
  const [openAlertBox, setOpenAlertBox] = useState<any>({
    data: {},
    state: false,
  });

  const debouncedValue = useDebounce(searchText, 500);

  const payload = {
    url: "roles",
    page: currentPage,
    limit: limit,
    search: debouncedValue || "",
  };

  const { data, isLoading, error } = useGetAllRolesQuery(payload);
  const [deleteRole] = useDeleteRoleMutation();

  const handleAddUser = () => {
    setRolesDetail({});
    setOpenRolesModal(true);
  };

  const handleEdit = (item: any) => {
    setOpenRolesModal(true);
    setRolesDetail(item);
  };

  const handleClose = (value: string) => {
    setOpenAlertBox({
      data: {},
      state: false,
    });
  };

  const handleDeleteRole = async () => {
    try {
      const payload = {
        url: "roles",
        id: openAlertBox.data._id,
      };
      const resp = await deleteRole(payload).unwrap();
      if (resp?.code === deleteRoleCode) {
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
    router.push(`roles/${id}`);
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
          placeholder="Search role"
        />
        <Buttons
          text="Add Role"
          sx={{ textTransform: "capitalize" }}
          onClick={handleAddUser}
        />
      </Box>

      {isLoading ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : !data?.data?.length ? (
        <NoDataFound text="No data Found" />
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
                {data?.data?.map((item: any, index: number) => {
                  return (
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
                        {item.teamName}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {item.teamEmail}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          {item?.teamUsers?.length > 3
                            ? item?.teamUsers
                                ?.slice(0, 3)
                                ?.map((it: any) => (
                                  <Chip
                                    label={it.firstName + " " + it.lastName}
                                  />
                                ))
                            : item?.teamUsers?.map((it: any) => (
                                <Chip
                                  label={it.firstName + " " + it.lastName}
                                />
                              ))}
                          {item?.teamUsers?.length > 3 && (
                            <Chip
                              sx={{ fontSize: "11px" }}
                              label={
                                "+" +
                                " " +
                                (item?.teamUsers?.length - 3) +
                                " " +
                                "more"
                              }
                            />
                          )}
                        </Box>
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
                  );
                })}
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

      {openRolesModal && (
        <AddRolesModal
          openRolesModal={openRolesModal}
          onClose={() => setOpenRolesModal(false)}
          rolesDetail={rolesDetail}
        />
      )}

      {openAlertBox && (
        <AlertBox
          open={openAlertBox.state}
          cancelText="No Cancel"
          confirmText="Yes Delete"
          mainHeaderText="Are you sure you want to delete"
          userName={openAlertBox.data.teamName}
          onClose={handleClose}
          handleClick={handleDeleteRole}
        />
      )}
    </>
  );
};

export default Roles;
