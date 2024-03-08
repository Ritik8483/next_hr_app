import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Paper, Typography } from "@mui/material";

const tableHeadings = [
  "S.No.",
  "Feedback Name",
  "Input",
  "Score",
  "Description",
  "MCQ Option",
];

const ETMAnonymousTable = (props: any) => {
  const { feedbackResponseList, tableRef } = props;

  return (
    <TableContainer ref={tableRef} sx={{ marginTop: "20px" }} component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            {tableHeadings.map((item: string) => (
              <TableCell
                sx={{ border: "1px solid black" }}
                align={item === "S.No." ? "left" : "center"}
                key={item}
              >
                {item}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {feedbackResponseList?.feedback_parameters?.map(
            (row: any, index: number) => {
              const filterArr = feedbackResponseList?.responses?.filter(
                (it: any) => it?._id === row?._id
              );
              return (
                <TableRow
                  sx={{ border: "1px solid black" }}
                  key={row._id + index}
                >
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    align="left"
                    component="th"
                    scope="row"
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    width="30%"
                    align="center"
                  >
                    {row.feedbackName}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {filterArr?.map((item: any, ind: number) => {
                      return (
                        <Typography>
                          {item.input ? `${ind + 1}. ${item.input}` : "__"}
                        </Typography>
                      );
                    })}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {filterArr?.map((item: any, ind: number) => {
                      return (
                        <Typography>
                          {item.score ? `${ind + 1}. ${item.score}` : "__"}
                        </Typography>
                      );
                    })}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {filterArr?.map((item: any, ind: number) => {
                      return (
                        <Typography>
                          {item.description
                            ? `${ind + 1}. ${item.description}`
                            : "__"}
                        </Typography>
                      );
                    })}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {filterArr?.map((item: any, ind: number) => {
                      return (
                        <Typography>
                          {item.option ? `${ind + 1}. ${item.option}` : "__"}
                        </Typography>
                      );
                    })}
                  </TableCell>
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ETMAnonymousTable;
