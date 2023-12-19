"use client";

import React, { useState, useEffect } from "react";
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
import { StyledTableCell, StyledTableRow } from "@/styles/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaginationTable from "@/components/resuseables/Pagination";
import useDebounce from "@/components/hooks/useDebounce";
import AlertBox from "@/components/resuseables/AlertBox";
import { openAlert } from "@/redux/slices/snackBarSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

const tableHeadings = ["S.No.", "Team Name", "Team email", "Users", "Actions"];

const Roles = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>("");
  const [openRolesModal, setOpenRolesModal] = useState<boolean>(false);
  const [rolesList, setRolesList] = useState([]);
  const [totalCount, setTotalCount] = useState<number>();
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(10);
  const [prevOffset, setPrevOffset] = useState<number>(0);
  const [totalNoOfItems, setTotalNoOfItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolesDetail, setRolesDetail] = useState({});
  const [openAlertBox, setOpenAlertBox] = useState<any>({
    data: {},
    state: false,
  });

  const debouncedValue = useDebounce(searchText, 500);

  const handleAddUser = () => {
    setRolesDetail({});
    setOpenRolesModal(true);
  };

  const getRolesData = async () => {
    try {
      if (debouncedValue.length > 0) {
        const usersRef = collection(db, "roles");
        const querySearch = query(
          usersRef,
          or(
            where("teamName", "==", debouncedValue),
            where("teamEmail", "==", debouncedValue)
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
        setRolesList(singleUserArr);
      } else {
        const querySnapshot: any = await getDocs(collection(db, "roles"));
        const total: number = Math.ceil(querySnapshot?.docs?.length / 10);
        setTotalNoOfItems(querySnapshot?.docs?.length);
        setTotalCount(total);
        const allRolesData = querySnapshot?.docs
          ?.reverse()
          ?.slice(prevOffset, offset)
          ?.map((doc: any) => {
            return {
              id: doc.id,
              ...doc.data(),
            };
          });
        setRolesList(allRolesData);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    getRolesData();
    setTimeout(() => {
      setIsEmpty(true);
    }, 3000);
  }, [openRolesModal, openAlertBox, currentPage, debouncedValue]);

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
      await deleteDoc(doc(db, "roles", openAlertBox.data.id));
      dispatch(
        openAlert({
          type: "success",
          message: "Role deleted successfully!",
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

      {!rolesList?.length && isEmpty ? (
        <NoDataFound text="No data Found" />
      ) : !rolesList?.length ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : rolesList?.length ? (
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
                {rolesList.map((item: any, index: number) => (
                  <StyledTableRow
                    onClick={() => handleRowClick(item.id)}
                    key={item.id}
                  >
                    <StyledTableCell component="th" scope="row">
                      {currentPage === 1 ? index + 1 : prevOffset + index + 1}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.teamName}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {item.teamEmail}
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      align="center"
                    >
                      {item?.teamUsers?.map((it: any) => (
                        <Chip label={it.firstName + " " + it.lastName} />
                      ))}
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
