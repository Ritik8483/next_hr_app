import React from "react";
import PaginationTable from "@/components/resuseables/Pagination";
import { limit, tableHeadings } from "@/constants/constant";
import { StyledTableCell, StyledTableRow } from "@/styles/styles";
import {
  Box,
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

const FeedbackParameterTable = ({
  data,
  currentPage,
  setCurrentPage,
  handleRowClick,
  handleEdit,
  setOpenAlertBox,
}: any) => {
  return (
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
                  {item.feedback_parameter_type}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {item.feedbackName}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {item?.mcqOption.length
                    ? item?.mcqOption.map((it: string, index: number) => (
                        <Box key={it}>
                          <Typography>
                            {it === "" ? "" : index + 1 + "."}{" "}
                            {it === "" ? "_" : it}
                          </Typography>
                        </Box>
                      ))
                    : item.feedbackDescription === ""
                    ? "_"
                    : item.feedbackDescription}
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

export default FeedbackParameterTable;
