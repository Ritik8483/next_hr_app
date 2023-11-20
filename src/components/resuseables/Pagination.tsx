import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import Pagination from "@mui/material/Pagination";

const PaginationTable = (props: any) => {
  const {
    prevOffset,
    offset,
    totalNoOfItems,
    totalCount,
    currentPage,
    setCurrentPage,
    onClick,
    setOffset,
    setPrevOffset,
  } = props;
  const handlePagination = (value: number) => {
    setCurrentPage(value);
    setOffset(value * 10);
    setPrevOffset((value - 1) * 10);
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
          Showing {prevOffset + 1} -{" "}
          {totalCount === currentPage ? totalNoOfItems : offset} of{" "}
          {totalNoOfItems} {totalNoOfItems === 1 ? "entry" : "enteries"}
        </Typography>
        <Pagination
          onChange={(e: React.ChangeEvent<unknown>, value: number) =>
            handlePagination(value)
          }
          onClick={onClick}
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
