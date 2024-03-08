import React from "react";
import PaginationTable from "@/components/resuseables/Pagination";
import { limit, tableGroupFeedbacks } from "@/constants/constant";
import { StyledTableCell, StyledTableRow } from "@/styles/styles";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const GroupParametersTable = ({
  data,
  currentPage,
  setCurrentPage,
  handleRowClick,
  handleGroupEdit,
  setOpenAlertBox,
}: any) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            {tableGroupFeedbacks.map((item: string) => (
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
            console.log("item", item);

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
                  {item.feedbackGroupName}
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
                    {item?.groupFeedbacks.length > 3
                      ? item?.groupFeedbacks
                          ?.slice(0, 3)
                          ?.map((it: any) => (
                            <Chip
                              label={
                                it.feedbackName.length > 30
                                  ? it.feedbackName.substring(0, 30) + "..."
                                  : it.feedbackName
                              }
                            />
                          ))
                      : item?.groupFeedbacks?.map((it: any) => (
                          <Chip
                            label={
                              it.feedbackName.length > 30
                                ? it.feedbackName.substring(0, 30) + "..."
                                : it.feedbackName
                            }
                          />
                        ))}

                    {item?.groupFeedbacks?.length > 3 && (
                      <Chip
                        sx={{ fontSize: "11px" }}
                        label={
                          "+" +
                          " " +
                          (item?.groupFeedbacks?.length - 3) +
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
                  <Box display="flex" gap="15px" justifyContent="flex-end">
                    <EditIcon
                      onClick={() => handleGroupEdit(item)}
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
  );
};

export default GroupParametersTable;
