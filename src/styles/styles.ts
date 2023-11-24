import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const modalStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "472px",
  height: "510px",
  backgroundColor: "#fff",
  borderRadius: "16px",
  boxShadow: "24",
};

const modalCrossStyle = {
  color: "#fff",
  position: "absolute",
  top: "-30px",
  cursor: "pointer",
  right: 0,
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "var(--primaryThemeBlue)",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const searchFieldMenuItem = {
  width: "100%",
  "&:hover": {
    cursor: "pointer",
    backgroundColor: "#fff",
  },
  "&:focus": {
    cursor: "pointer",
    backgroundColor: "#fff",
  },
};

export {
  modalStyles,
  modalCrossStyle,
  StyledTableCell,
  StyledTableRow,
  searchFieldMenuItem,
};
