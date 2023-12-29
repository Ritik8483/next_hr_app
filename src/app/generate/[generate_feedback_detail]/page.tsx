"use client";

import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Avatar, Breadcrumbs, Chip } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { ETM, MTE } from "@/constants/constant";
import MTEtable from "./MTEtable";
import ETMtable from "./ETMtable";
import html2PDF from "jspdf-html2canvas";
import { DownloadTableExcel } from "react-export-table-to-excel";
import Buttons from "@/components/resuseables/Buttons";
import { useGetSingleFeedbackFormDetailQuery } from "@/redux/api/api";

const GenerateFeedbackDetail = () => {
  const router: any = useRouter();
  const tableRef: any = useRef();
  const { generate_feedback_detail } = useParams<any>();
  const [feedbackResponseList, setFeedbackResponseList] = useState<any>({});
  const [doneReviewers, setDoneReviewers] = useState<any>([]);
  const [pendingMTEReviews, setPendingMTEReviews] = useState<any>([]);
  const [peoplesToReviewArr, setPeoplesToReviewArr] = useState<any>([]);
  const [pendingReviewers, setPendingReviewers] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [openAllCollapses, setOpenAllCollapses] = useState(false);
  const [openId, setOpenId] = useState<string>("");

  const payload = {
    url: "feedback-form",
    id: generate_feedback_detail,
  };
  const { data, isLoading } = useGetSingleFeedbackFormDetailQuery(payload);

  const handleOpenTable = (id: string) => {
    setOpenId(id);
    setOpen(!open);
  };

  const handleGenerte = () => {
    localStorage.removeItem("generateId");
    router.push("/generate");
  };

  const breadcrumbs = [
    <Typography
      sx={{ cursor: "pointer" }}
      onClick={handleGenerte}
      key="3"
      color="var(--primaryThemeBlue)"
    >
      Generate
    </Typography>,
    <Typography sx={{ cursor: "pointer" }} color="var(--primaryThemeBlue)">
      {Array.isArray(feedbackResponseList?.review)
        ? feedbackResponseList?.review
            ?.map((it: any) => it.teamName || it.firstName + " " + it.lastName)
            .toString()
        : feedbackResponseList?.review?.firstName +
          " " +
          feedbackResponseList?.review?.lastName}
    </Typography>,
  ];

  const downloadPrintPDF = async () => {
    await html2PDF(tableRef.current, {
      jsPDF: {
        format: "a4",
      },
      html2canvas: {
        scrollX: 0,
        scrollY: -window.scrollY,
        imageTimeout: 15000,
        logging: true,
        useCORS: true,
      },
      imageType: "image/jpeg",
      margin: { top: 15, right: 10, bottom: 20, left: 10 },
      output: `ql.pdf`,
    });
    setOpenAllCollapses(false);
    // domElement.style.display = 'none';
    // setLoad(false);
  };

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs}
      </Breadcrumbs>

      {/* <DownloadTableExcel
        filename="users table"
        sheet="users"
        currentTableRef={tableRef.current}
      >
        <button> Export excel </button>
      </DownloadTableExcel>

      <Buttons
        text="download PDF"
        onMouseOver={() => setOpenAllCollapses(true)}
        onClick={downloadPrintPDF}
      /> */}
      <Box ref={tableRef}>
        <Box marginTop="20px" display="flex" flexDirection="column" gap="20px">
          {data?.data?.feedback_type === MTE ? (
            <Typography>
              Total{" "}
              {Array.isArray(data?.data?.review)
                ? "persons to review"
                : "Reviewers"}{" "}
              : {peoplesToReviewArr?.length}
            </Typography>
          ) : (
            <Typography>
              Total{" "}
              {data?.data?.reviewer?.length === 1 ? "Reviewer" : "Reviewers"} :{" "}
              {data?.data?.reviewer?.length}
            </Typography>
          )}
          {data?.data?.feedback_type === MTE &&
          data?.data?.reviewer?.length > 1 &&
          data?.data?.review?.length > 1 ? (
            <Box display="flex" gap="5px" alignItems="center">
              Done Review of :{" "}
              {data?.data?.responses?.length
                ? data?.data?.responses?.map((item: any) => (
                    <Chip
                      avatar={
                        <Avatar>
                          {item?.firstName.substring(0, 1) +
                            item?.lastName.substring(0, 1)}
                        </Avatar>
                      }
                      label={
                        item?.userInfo?.firstName +
                        " " +
                        item?.userInfo?.lastName
                      }
                    />
                  ))
                : 0}
            </Box>
          ) : data?.data?.feedback_type === MTE ? (
            <Box display="flex" gap="5px" alignItems="center">
              Done Review of :{" "}
              {data?.data?.responses?.length
                ? data?.data?.responses?.map((item: any) => (
                    <Chip
                      key={item?.userInfo?.id}
                      label={
                        item?.userInfo?.firstName +
                        " " +
                        item?.userInfo?.lastName
                      }
                      variant="outlined"
                    />
                  ))
                : 0}
            </Box>
          ) : (
            <Box display="flex" gap="5px" alignItems="center">
              Done By :{" "}
              {doneReviewers?.length
                ? doneReviewers?.map((item: any) => (
                    <Chip
                      key={item.id}
                      label={
                        item.firstName +
                        " " +
                        item.lastName +
                        " " +
                        "(" +
                        item.email +
                        ")"
                      }
                      variant="outlined"
                    />
                  ))
                : 0}
            </Box>
          )}

          {data?.data?.feedback_type === MTE &&
          data?.data?.reviewer?.length > 1 &&
          data?.data?.review?.length > 1 ? null : data?.data?.feedback_type ===
            MTE ? (
            <Box display="flex" gap="5px" alignItems="center">
              Pending reviews of :{" "}
              {pendingMTEReviews?.length
                ? pendingMTEReviews?.map((item: any) => (
                    <Chip
                      key={item.id}
                      label={item.firstName + " " + item.lastName}
                      variant="outlined"
                    />
                  ))
                : 0}
            </Box>
          ) : (
            <Box display="flex" gap="5px" alignItems="center">
              Pending By :{" "}
              {pendingReviewers?.length
                ? pendingReviewers?.map((item: any) => (
                    <Chip
                      key={item.id}
                      label={
                        item.firstName +
                        " " +
                        item.lastName +
                        " " +
                        "(" +
                        item.email +
                        ")"
                      }
                      variant="outlined"
                    />
                  ))
                : 0}
            </Box>
          )}
        </Box>

        {isLoading ? (
          <SkeletonTable
            variant="rounded"
            width="100%"
            sx={{ marginTop: "20px" }}
            height="calc(100vh - 180px)"
          />
        ) : data?.data?.hasOwnProperty("responses") &&
          data?.data?.feedback_type === MTE ? (
          <>
            <MTEtable
              feedbackResponseList={data?.data}
              handleOpenTable={handleOpenTable}
              open={open}
              openId={openId}
              openAllCollapses={openAllCollapses}
            />
          </>
        ) : data?.data?.hasOwnProperty("responses") &&
          data?.data?.responses?.length &&
          data?.data?.feedback_type === ETM ? (
          <>
            <ETMtable
              feedbackResponseList={data?.data}
              handleOpenTable={handleOpenTable}
              open={open}
              openId={openId}
              openAllCollapses={openAllCollapses}
            />
          </>
        ) : (
          <NoDataFound text="No responses yet!" />
        )}
      </Box>
    </>
  );
};

export default GenerateFeedbackDetail;
