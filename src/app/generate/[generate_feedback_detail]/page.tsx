"use client";

import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { useParams, useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Breadcrumbs } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { ETM, MTE, SA } from "@/constants/constant";
import MTEtable from "./MTEtable";
import ETMtable from "./ETMtable";
import html2PDF from "jspdf-html2canvas";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { useGetSingleFeedbackFormDetailQuery } from "@/redux/api/api";
import Buttons from "@/components/resuseables/Buttons";
import SAtable from "./SAtable";

const GenerateFeedbackDetail = () => {
  const router: any = useRouter();
  const tableRef: any = useRef();
  const { generate_feedback_detail } = useParams<any>();
  const [open, setOpen] = useState(false);
  const [openAllCollapses, setOpenAllCollapses] = useState(false);
  const [openId, setOpenId] = useState<string>("");

  const payload = {
    url: "feedback-form",
    id: generate_feedback_detail,
  };
  const { data, isLoading, isSuccess } = useGetSingleFeedbackFormDetailQuery(
    payload,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const handleOpenTable = (id: string) => {
    setOpenId(id);
    setOpen(!open);
  };

  const handleGenerte = () => {
    router.push("/generate");
  };

  const reviewrs = data?.data?.review?.map(
    (it: any) => it.firstName + " " + it.lastName
  );

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
      {data?.data?.feedback_type === SA
        ? SA
        : reviewrs?.length > 2
        ? reviewrs?.splice(0, 2).toString() + "..."
        : reviewrs?.toString()}
    </Typography>,
  ];

  const downloadFunc = async () => {
    const resp = await html2PDF(tableRef.current, {
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
    if (resp?.AcroForm) {
      setOpenAllCollapses(false);
    }
  };

  const downloadPrintPDF = async () => {
    setOpenAllCollapses(true);
    setTimeout(() => {
      downloadFunc();
    }, 500);
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
      </DownloadTableExcel> */}

      <Buttons
        text="download PDF"
        onClickCapture={() => setOpenAllCollapses(true)}
        onClick={downloadPrintPDF}
      />
      <Box ref={tableRef}>
        {isLoading ? (
          <SkeletonTable
            variant="rounded"
            width="100%"
            sx={{ marginTop: "20px" }}
            height="calc(100vh - 180px)"
          />
        ) : !data?.data?.responses?.length ? (
          <NoDataFound text="No data Found" />
        ) : data?.data?.feedback_type === MTE &&
          data?.data?.responses?.length ? (
          <>
            <MTEtable
              feedbackResponseList={data?.data}
              handleOpenTable={handleOpenTable}
              open={open}
              openId={openId}
              openAllCollapses={openAllCollapses}
            />
          </>
        ) : data?.data?.feedback_type === ETM &&
          data?.data?.responses?.length ? (
          <>
            <ETMtable
              feedbackResponseList={data?.data}
              handleOpenTable={handleOpenTable}
              open={open}
              openId={openId}
              openAllCollapses={openAllCollapses}
            />
          </>
        ) : data?.data?.feedback_type === SA &&
          data?.data?.responses?.length ? (
          <>
            <SAtable
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
