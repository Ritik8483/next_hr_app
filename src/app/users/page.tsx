"use client";

import React, { useEffect, useState } from "react";
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
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  or,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import NoDataFound from "@/components/resuseables/NoDataFound";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slices/snackBarSlice";
import PaginationTable from "@/components/resuseables/Pagination";
import useDebounce from "@/components/hooks/useDebounce";
import SearchField from "@/components/resuseables/SearchField";
import { StyledTableCell, StyledTableRow } from "@/styles/styles";
import { useRouter } from "next/navigation";

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
  const [totalCount, setTotalCount] = useState<number>();
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(10);
  const [prevOffset, setPrevOffset] = useState<number>(0);
  const [totalNoOfItems, setTotalNoOfItems] = useState<number>(0);
  const [usersList, setUsersList] = useState([]);
  const [userDetail, setUserDetail] = useState({});
  const debouncedValue = useDebounce(searchText, 500);

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

  const getData = async () => {
    try {
      if (debouncedValue.length > 0) {
        const usersRef = collection(db, "users");
        const querySearch = query(
          usersRef,
          or(
            where("firstName", "==", debouncedValue),
            where("email", "==", debouncedValue)
          )
        );
        const querySnapshot = await getDocs(querySearch);
        const total: number = Math.ceil(querySnapshot?.docs?.length / 10);
        setTotalNoOfItems(querySnapshot?.docs?.length);
        const singleUserArr: any = querySnapshot?.docs?.map((doc: any) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setTotalCount(total);
        setUsersList(singleUserArr);
      } else {
        const querySnapshot: any = await getDocs(collection(db, "users"));
        const total: number = Math.ceil(querySnapshot?.docs?.length / 10);
        setTotalNoOfItems(querySnapshot?.docs?.length);
        setTotalCount(total);
        const allUsersData = querySnapshot?.docs
          ?.reverse()
          ?.slice(prevOffset, offset)
          ?.map((doc: any) => {
            return {
              id: doc.id,
              ...doc.data(),
            };
          });

        setUsersList(allUsersData);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getData();
    setTimeout(() => {
      setIsEmpty(true);
    }, 3000);
  }, [openAddUserModal, openAlertBox, currentPage, debouncedValue]);

  const handleEdit = (item: any) => {
    setOpenAddUserModal(true);
    setUserDetail(item);
  };

  const handleDeleteUser = async () => {
    try {
      await deleteDoc(doc(db, "users", openAlertBox.data.id));
      dispatch(
        openAlert({
          type: "success",
          message: "User deleted successfully!",
        })
      );
      if (totalNoOfItems - 1 === prevOffset || totalNoOfItems - 1 === offset) {
        setOffset(offset === 10 ? 10 : offset - 10);
        setPrevOffset(
          prevOffset === 10 || prevOffset === 0 ? 0 : prevOffset - 10
        );
        setCurrentPage(
          totalNoOfItems - 1 === prevOffset || totalNoOfItems - 1 === offset
            ? currentPage - 1
            : currentPage
        );
      }
      setOpenAlertBox(false);
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

      {!usersList?.length && isEmpty ? (
        <NoDataFound text="No data Found" />
      ) : !usersList?.length ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : usersList?.length ? (
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
                {usersList.map((item: any, index: number) => (
                  <StyledTableRow
                    onClick={() => handleRowClick(item.id)}
                    key={item.id}
                  >
                    <StyledTableCell component="th" scope="row">
                      {currentPage === 1 ? index + 1 : prevOffset + index + 1}
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
                      <Box display="flex" gap="15px" justifyContent="flex-end">
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
              prevOffset={prevOffset}
              offset={offset}
              onClick={() => setSearchText("")}
              totalNoOfItems={totalNoOfItems}
              totalCount={totalCount}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setOffset={setOffset}
              setPrevOffset={setPrevOffset}
            />
          </TableContainer>
        </>
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
