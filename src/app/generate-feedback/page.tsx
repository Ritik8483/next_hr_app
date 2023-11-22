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
import GenerateFeedbackModal from "./GenerateFeedbackModal";

const GenerateFeedback = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [feedbackFormModal, setFeedbackFormModal] = useState<boolean>(false);
  const [feedbackFormDetail, setFeedbackFormDetail] = useState({});

  const handleAddUser = () => {
    setFeedbackFormDetail({});
    setFeedbackFormModal(true);
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="end"
        alignItems="center"
        marginBottom="24px"
      >
        <Buttons
          text="Generate Feedback"
          sx={{ textTransform: "capitalize" }}
          onClick={handleAddUser}
        />
      </Box>
      {feedbackFormModal && (
        <GenerateFeedbackModal
          feedbackFormModal={feedbackFormModal}
          onClose={() => setFeedbackFormModal(false)}
          feedbackFormDetail={feedbackFormDetail}
        />
      )}
    </>
  );
};

export default GenerateFeedback;
