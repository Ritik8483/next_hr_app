"use client";

import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { db } from "@/firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Avatar, Breadcrumbs, Chip } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { ETM, MTE } from "@/constants/constant";
import MTEtable from "./MTEtable";
import ETMtable from "./ETMtable";

const GenerateFeedbackDetail = () => {
  const router: any = useRouter();
  const { generate_feedback_detail } = useParams<any>();
  const [feedbackResponseList, setFeedbackResponseList] = useState<any>({});
  const [doneReviewers, setDoneReviewers] = useState<any>([]);
  const [pendingMTEReviews, setPendingMTEReviews] = useState<any>([]);
  const [peoplesToReviewArr, setPeoplesToReviewArr] = useState<any>([]);
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
        if (
          docSnap?.data()?.feedback_type === MTE &&
          Array.isArray(docSnap?.data()?.review)
        ) {
          const filterUserArr = docSnap
            ?.data()
            ?.review?.map((it: any) => it.id);
          const usersArr = filterUserArr?.filter(
            (it: string) => it !== undefined
          );

          const filteredTeamsArr = docSnap
            ?.data()
            ?.review?.filter((it: any) =>
              Object.keys(it).some((key) => key?.includes("team"))
            );
          const arrOfUsers = docSnap
            ?.data()
            ?.review?.filter((it: any) =>
              Object.keys(it).some((key) => key?.includes("firstName"))
            );
          const teamUsersArr = filteredTeamsArr.map((it: any) => {
            return it.teamUsers.filter(
              (items: any) => !usersArr?.includes(items.id)
            );
          });
          const filteredUsersFromTeams = arrOfUsers.concat(...teamUsersArr);
          setPeoplesToReviewArr(filteredUsersFromTeams);

          const usersMTEArr = docSnap
            ?.data()
            ?.responses?.map((it: any) => it.userInfo.id);

          const pendingReviewArr = filteredUsersFromTeams?.filter(
            (it: any) => !usersMTEArr?.includes(it.id)
          );
          setPendingMTEReviews(pendingReviewArr);
        }

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

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs}
      </Breadcrumbs>

      <Box marginTop="20px" display="flex" flexDirection="column" gap="20px">
        {feedbackResponseList?.feedback_type === MTE ? (
          <Typography>
            Total{" "}
            {Array.isArray(feedbackResponseList?.review)
              ? "persons to review"
              : "Reviewers"}{" "}
            : {peoplesToReviewArr?.length}
          </Typography>
        ) : (
          <Typography>
            Total{" "}
            {feedbackResponseList?.reviewer?.length === 1
              ? "Reviewer"
              : "Reviewers"}{" "}
            : {feedbackResponseList?.reviewer?.length}
          </Typography>
        )}
        {feedbackResponseList?.feedback_type === MTE &&
        feedbackResponseList?.reviewer?.length > 1 &&
        feedbackResponseList?.review?.length > 1 ? (
          <Box display="flex" gap="5px" alignItems="center">
            Done Review of :{" "}
            {feedbackResponseList?.responses?.length
              ? feedbackResponseList?.responses?.map((item: any) => (
                  <Chip
                    avatar={
                      <Avatar>
                        {item?.firstName.substring(0, 1) +
                          item?.lastName.substring(0, 1)}
                      </Avatar>
                    }
                    label={
                      item?.userInfo?.firstName + " " + item?.userInfo?.lastName
                    }
                  />
                ))
              : 0}
          </Box>
        ) : feedbackResponseList?.feedback_type === MTE ? (
          <Box display="flex" gap="5px" alignItems="center">
            Done Review of :{" "}
            {feedbackResponseList?.responses?.length
              ? feedbackResponseList?.responses?.map((item: any) => (
                  <Chip
                    key={item?.userInfo?.id}
                    label={
                      item?.userInfo?.firstName + " " + item?.userInfo?.lastName
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

        {feedbackResponseList?.feedback_type === MTE &&
        feedbackResponseList?.reviewer?.length > 1 &&
        feedbackResponseList?.review?.length > 1 ? null : feedbackResponseList?.feedback_type === MTE ? (
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

      {Object.keys(feedbackResponseList).length === 0 ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          sx={{ marginTop: "20px" }}
          height="calc(100vh - 180px)"
        />
      ) : feedbackResponseList.hasOwnProperty("responses") &&
        feedbackResponseList?.feedback_type === MTE ? (
        <>
          <MTEtable
            feedbackResponseList={feedbackResponseList}
            handleOpenTable={handleOpenTable}
            open={open}
            openId={openId}
          />
        </>
      ) : feedbackResponseList.hasOwnProperty("responses") &&
        feedbackResponseList?.responses?.length &&
        feedbackResponseList?.feedback_type === ETM ? (
        <>
          <ETMtable
            feedbackResponseList={feedbackResponseList}
            handleOpenTable={handleOpenTable}
            open={open}
            openId={openId}
          />
        </>
      ) : (
        <NoDataFound text="No responses yet!" />
      )}
    </>
  );
};

export default GenerateFeedbackDetail;
