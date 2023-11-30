"use client";

import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { db } from "@/firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Breadcrumbs, Chip } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const tableHeadings = [
  "S.No.",
  "First Name",
  "Last Name",
  "Email",
  "Designation",
];

const tableSubHeadings = [
  "S.No.",
  "Feedback Name",
  "Score",
  "Description",
  "Feedback Type",
];

const GenerateFeedbackDetail = () => {
  const router: any = useRouter();
  const { generate_feedback_detail } = useParams<any>();
  const [feedbackResponseList, setFeedbackResponseList] = useState<any>({});
  const [doneReviewers, setDoneReviewers] = useState<any>([]);
  const [pendingReviewers, setPendingReviewers] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState<string>("");
  const pathName = usePathname();

  const getFeedbacksData = async () => {
    try {
      const docRef = doc(db, "feedback_form", generate_feedback_detail);
      const docSnap: any = await getDoc(docRef);
      if (docSnap.exists()) {
        setFeedbackResponseList(docSnap?.data());

        const querySnapshot: any = await getDocs(collection(db, "users"));
        const allUsersData = querySnapshot?.docs?.map((doc: any) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });

        const filteredNames = allUsersData?.filter((item: any) =>
          docSnap.data()?.reviewer?.includes(item.id)
        );
        const doneUsers = filteredNames.filter(
          (item: any) => !docSnap?.data()?.responses?.includes(item.id)
        );
        const pendingUsers = filteredNames.filter((item: any) =>
          docSnap?.data()?.responses?.includes(item.id)
        );

        if (docSnap?.data()?.responses?.length) {
          setDoneReviewers(doneUsers);

          setPendingReviewers(pendingUsers);
        }
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    getFeedbacksData();
  }, []);

  const handleOpenTable = (id: string) => {
    setOpenId(id);
    setOpen(!open);
  };

  const handleGenerte = () => {
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
      {feedbackResponseList?.review
        ? feedbackResponseList?.review?.firstName +
          " " +
          feedbackResponseList?.review?.lastName
        : "_"}
    </Typography>,
  ];
  
  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs}
      </Breadcrumbs>

      <Box marginTop="20px" display="flex" flexDirection="column" gap="20px">
        <Typography>
          Total{" "}
          {feedbackResponseList?.reviewer?.length === 1
            ? "Reviewer"
            : "Reviewers"}{" "}
          : {feedbackResponseList?.reviewer?.length}
        </Typography>
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
      </Box>

      {Object.keys(feedbackResponseList).length === 0 ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          sx={{ marginTop: "20px" }}
          height="calc(100vh - 180px)"
        />
      ) : feedbackResponseList.hasOwnProperty("responses") &&
        feedbackResponseList?.responses?.length ? (
        <>
          <TableContainer sx={{ marginTop: "20px" }} component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
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
                {feedbackResponseList?.responses
                  ?.filter((item: any) => typeof item !== "string")
                  ?.map((row: any, index: number) => (
                    <>
                      <TableRow
                        key={row.id}
                        sx={{ "& > *": { borderBottom: "unset" } }}
                      >
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => handleOpenTable(row.id)}
                          >
                            {openId === row.id && open ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {index + 1}
                        </TableCell>
                        <TableCell align="center">{row.firstName}</TableCell>
                        <TableCell align="center">{row.lastName}</TableCell>
                        <TableCell align="center">{row.email}</TableCell>
                        <TableCell align="center">{row.designation}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={6}
                        >
                          <Collapse
                            in={openId === row.id && open}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 1 }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                              >
                                Feedback Response
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
                                  {row?.form_response?.map(
                                    (historyRow: any, index: number) => (
                                      <TableRow key={historyRow.id}>
                                        <TableCell component="th" scope="row">
                                          {index + 1}
                                        </TableCell>
                                        <TableCell align="center">
                                          {historyRow.feedbackName}
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
                                          {historyRow.type}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <NoDataFound text="No responses yet!" />
      )}
    </>
  );
};

export default GenerateFeedbackDetail;
