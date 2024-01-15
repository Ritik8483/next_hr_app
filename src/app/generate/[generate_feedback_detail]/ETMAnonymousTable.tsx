import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Paper } from "@mui/material";

const tableHeadings = [
  "S.No.",
  "Feedback Name",
  "Input",
  "Score",
  "Description",
  "MCQ Option",
];

const ETMAnonymousTable = (props: any) => {
  const { feedbackResponseList } = props;

  return (
    <TableContainer sx={{ marginTop: "20px" }} component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            {tableHeadings.map((item: string) => (
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
          {feedbackResponseList?.responses?.map((row: any, index: number) => (
            <TableRow key={row._id}>
              <TableCell align="left" component="th" scope="row">
                {index + 1}
              </TableCell>
              <TableCell align="center">{row.feedbackName}</TableCell>
              <TableCell align="center">{row.input || "_"}</TableCell>
              <TableCell align="center">
                {row.score === "" ? "__" : row.score}
              </TableCell>
              <TableCell align="center">
                {row.description === "" ? "__" : row.description}
              </TableCell>
              <TableCell align="center">
                {!row.option ? "__" : row.option}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ETMAnonymousTable;
