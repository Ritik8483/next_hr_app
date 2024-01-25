import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { limit } from "@/constants/constant";

const PaginationTable = (props: any) => {
  const { totalCount, currentPage, setCurrentPage, totalNumber } = props;
  const handlePagination = (value: number) => {
    setCurrentPage(value);
  };

  return (
    <>
      <Divider />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        padding="10px 0"
        paddingLeft="15px"
      >
        <Typography fontSize="14px" color="var(--iconGrey)">
          Showing {currentPage * limit + 1 - limit} -{" "}
          {totalNumber === currentPage
            ? totalNumber
            : limit * currentPage < totalNumber
            ? limit * currentPage
            : totalNumber}{" "}
          of {totalNumber} {totalNumber === 1 ? "entry" : "enteries"}
        </Typography>
        <Pagination
          onChange={(e: React.ChangeEvent<unknown>, value: number) =>
            handlePagination(value)
          }
          count={totalCount}
          defaultPage={1}
          page={currentPage}
          color="primary"
        />
      </Box>
    </>
  );
};

export default PaginationTable;
