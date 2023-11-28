"use client";

import NoDataFound from "@/components/resuseables/NoDataFound";
import SkeletonTable from "@/components/resuseables/SkeletonTable";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const GenerateFeedbackDetail = () => {
  const router: any = useRouter();
  const { generate_feedback_detail } = useParams<any>();
  const [formQueDetails, setFormQueDetails] = useState<any>({});
  const [feedbackResponseList, setFeedbackResponseList] = useState([]);
  const getAllFeedbackParameters = async (item: string) => {
    const docRef = doc(db, "feedbacks", item);
    const docSnap: any = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap?.data(),
      };
    }
  };

  const getFeedbacksData = async () => {
    try {
      const docRef = doc(db, "feedback_form", generate_feedback_detail);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormQueDetails(docSnap?.data());
        const resp = docSnap?.data()?.feedback_parameters?.map((it: string) => {
          return getAllFeedbackParameters(it);
        });
        Promise.all(resp).then((val: any) => {
          const obj = val?.map((item: any) => {
            return {
              id: item.id,
              score: "",
              description: "",
              type: item.feedback_parameter_type,
            };
          });
          setFeedbackResponseList(val);
        });
        console.log("Document data:", docSnap.data());
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

  return (
    <>
      {!feedbackResponseList?.length ? (
        <SkeletonTable
          variant="rounded"
          width="100%"
          height="calc(100vh - 180px)"
        />
      ) : feedbackResponseList?.length ? (
        <></>
      ) : (
        <NoDataFound text="No data Found" />
      )}
    </>
  );
};

export default GenerateFeedbackDetail;
