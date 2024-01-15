"use client";

import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { useParams, useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import Box from "@mui/material/Box";
import { ETM, MTE, SA } from "@/constants/constant";
import MTEtable from "./MTEtable";
import ETMtable from "./ETMtable";
import html2PDF from "jspdf-html2canvas";
import { useGetSingleFeedbackFormDetailQuery } from "@/redux/api/api";
import Buttons from "@/components/resuseables/Buttons";
import SAtable from "./SAtable";
import ETMAnonymousTable from "./ETMAnonymousTable";
import Breadcrumb from "@/components/resuseables/Breadcrumb";

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

  const downloadFunc = async () => {
    const resp =
      tableRef.current &&
      (await html2PDF(tableRef.current, {
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
      }));
    if (resp?.AcroForm) {
      setOpenAllCollapses(false);
    }
  };

  const downloadPrintPDF = async () => {
    setOpenAllCollapses(true);
    setTimeout(() => {
      setOpenAllCollapses(false);
      downloadFunc();
    }, 500);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Breadcrumb
          onClick={handleGenerte}
          textFirst="Generate"
          textSecond={
            data?.data?.feedback_type === SA
              ? SA
              : reviewrs?.length > 2
              ? reviewrs?.splice(0, 2).toString() + "..."
              : reviewrs?.toString()
          }
        />

        <Buttons
          disabled={!data?.data?.responses?.length}
          text="Download PDF"
          onClick={downloadPrintPDF}
        />
      </Box>
      <Box>
        {isLoading || openAllCollapses ? (
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
          <MTEtable
            feedbackResponseList={data?.data}
            handleOpenTable={handleOpenTable}
            open={open}
            openId={openId}
          />
        ) : data?.data?.feedback_type === ETM &&
          data?.data?.responses?.length &&
          data?.data?.anonymous ? (
          <ETMAnonymousTable feedbackResponseList={data?.data} />
        ) : data?.data?.feedback_type === ETM &&
          data?.data?.responses?.length ? (
          <ETMtable
            feedbackResponseList={data?.data}
            handleOpenTable={handleOpenTable}
            open={open}
            openId={openId}
          />
        ) : data?.data?.feedback_type === SA &&
          data?.data?.responses?.length ? (
          <SAtable
            feedbackResponseList={data?.data}
            handleOpenTable={handleOpenTable}
            open={open}
            openId={openId}
          />
        ) : (
          <NoDataFound text="No responses yet!" />
        )}
      </Box>

      {openAllCollapses &&
        (data?.data?.feedback_type === ETM &&
        data?.data?.responses?.length &&
        data?.data?.anonymous ? (
          <ETMAnonymousTable
            tableRef={tableRef}
            feedbackResponseList={data?.data}
          />
        ) : data?.data?.feedback_type === ETM &&
          data?.data?.responses?.length ? (
          <ETMtable
            tableRef={tableRef}
            feedbackResponseList={data?.data}
            handleOpenTable={handleOpenTable}
            open={open}
            openId={openId}
            openAllCollapses={openAllCollapses}
          />
        ) : data?.data?.feedback_type === SA &&
          data?.data?.responses?.length ? (
          <SAtable
            tableRef={tableRef}
            feedbackResponseList={data?.data}
            handleOpenTable={handleOpenTable}
            open={open}
            openId={openId}
            openAllCollapses={openAllCollapses}
          />
        ) : (
          <MTEtable
            tableRef={tableRef}
            feedbackResponseList={data?.data}
            handleOpenTable={handleOpenTable}
            open={open}
            openId={openId}
            openAllCollapses={openAllCollapses}
          />
        ))}
    </>
  );
};

export default GenerateFeedbackDetail;
