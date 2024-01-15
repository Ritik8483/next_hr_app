import React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Paper } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SkeletonTable from "@/components/resuseables/SkeletonTable";

const tableHeadingsMTE = ["S.No.", "Reviewer", "Email", "Designation"];

const tableSubHeadings = [
  "S.No.",
  "Feedback Name",
  "Input",
  "Score",
  "Description",
  "MCQ Option",
];

const MTEtable = (props: any) => {
  const {
    feedbackResponseList,
    handleOpenTable,
    open,
    openId,
    openAllCollapses,
  } = props;
  return (
    <TableContainer sx={{ marginTop: "20px" }} component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            {tableHeadingsMTE.map((item: string) => (
              <TableCell
                align={item === "S.No." ? "left" : "center"}
                key={item}
              >
                {item}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {feedbackResponseList?.responses?.map((row: any, index: number) => {
            return (
              <>
                <TableRow
                  key={row._id}
                  sx={{ "& > *": { borderBottom: "unset" } }}
                >
                  <TableCell>
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => handleOpenTable(row._id)}
                    >
                      {openId === row._id && open ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell align="center">
                    {row.firstName + " " + row.lastName}
                  </TableCell>
                  <TableCell align="center">{row.email}</TableCell>
                  <TableCell align="center">{row.designation}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={6}
                  >
                    <Collapse
                      in={openAllCollapses || (openId === row?._id && open)}
                      timeout="auto"
                      unmountOnExit
                    >
                      {row?.userProgress?.map((items: any) => {
                        return (
                          <>
                            <Box key={items._id} sx={{ margin: 1 }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                              >
                                {items.firstName +
                                  " " +
                                  items.lastName +
                                  " " +
                                  "(" +
                                  items.email +
                                  ")"}
                              </Typography>
                              <Table size="small" aria-label="purchases">
                                <TableHead>
                                  <TableRow>
                                    {tableSubHeadings.map((item: string) => (
                                      <TableCell
                                        align={
                                          item === "S.No." ? "left" : "center"
                                        }
                                        key={item}
                                      >
                                        {item}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {items?.form_response?.map(
                                    (historyRow: any, index: number) => (
                                      <TableRow key={historyRow._id}>
                                        <TableCell component="th" scope="row">
                                          {index + 1}
                                        </TableCell>
                                        <TableCell align="center">
                                          {historyRow?.feedbackName}
                                        </TableCell>
                                        <TableCell align="center">
                                          {historyRow.input || "_"}
                                        </TableCell>
                                        <TableCell align="center">
                                          {historyRow.score === ""
                                            ? "__"
                                            : historyRow.score}
                                        </TableCell>
                                        <TableCell align="center">
                                          {historyRow.description === ""
                                            ? "__"
                                            : historyRow.description}
                                        </TableCell>
                                        <TableCell align="center">
                                          {!historyRow.option
                                            ? "__"
                                            : historyRow.option}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </Box>
                          </>
                        );
                      })}
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MTEtable;
