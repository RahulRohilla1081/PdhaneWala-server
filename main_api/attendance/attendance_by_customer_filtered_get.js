var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/attendance/attendance_by_customer_filtered_get?CUSTOMER_ID=PWC0000001&TEACHER_ID=&STUDENT_ID=&COURSE_ID=&BATCH_NO=&STATUS&IS_APPROVED=&START_DATE=&END_DATE=
*/

router.get("/", async function (req, res, next) {
  try {
    // console.log("QUERY", req.query);
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let TEACHER_ID = req.query.TEACHER_ID;
    let STUDENT_ID = req.query.STUDENT_ID;
    let COURSE_ID = req.query.COURSE_ID;
    let BATCH_NO = req.query.BATCH_NO;
    let STATUS = req.query.STATUS.toUpperCase();
    let IS_APPROVED = req.query.IS_APPROVED;
    let START_DATE = req.query.START_DATE;
    let END_DATE = req.query.END_DATE;

    var data_1 = [];

    let db = await dbConnect();

    // let data = await db
    //   .collection("attendance")
    //   .find({
    //     CUSTOMER_ID: CUSTOMER_ID,
    //   })
    //   .toArray();
    let temp_is_approved;

    if (IS_APPROVED == "") {
      temp_is_approved = { CUSTOMER_ID: CUSTOMER_ID };
    } else {
      temp_is_approved = { CUSTOMER_ID: CUSTOMER_ID, IS_APPROVED: IS_APPROVED };
    }

    let data = await db
      .collection("attendance")
      .aggregate([
       
        { $match: temp_is_approved },
        {
          $lookup: {
            from: "course_master",
            let: { course_id: "$COURSE_ID", customer_id: "$CUSTOMER_ID" },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$COURSE_ID", "$$course_id"] } },
                    { $expr: { $eq: ["$CUSTOMER_ID", "$$customer_id"] } },
                  ],
                },
              },
            ],
            as: "COURSE_NAME",
          },
        },
        {
          $lookup: {
            from: "batch_master",
            let: { batch_no: "$BATCH_NO", customer_id: "$CUSTOMER_ID" },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$BATCH_NO", "$$batch_no"] } },
                    { $expr: { $eq: ["$CUSTOMER_ID", "$$customer_id"] } },
                  ],
                },
              },
            ],
            as: "BATCH_NAME",
          },
        },
        {
          $lookup: {
            from: "user_db",
            let: { user_id: "$USER_ID", customer_id: "$CUSTOMER_ID" },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$USER_ID", "$$user_id"] } },
                    { $expr: { $eq: ["$CUSTOMER_ID", "$$customer_id"] } },
                  ],
                },
              },
            ],
            as: "STUDENT_NAME",
          },
        },
        {
          $lookup: {
            from: "user_db",
            let: { teacher_id: "$TEACHER_ID", customer_id: "$CUSTOMER_ID" },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$USER_ID", "$$teacher_id"] } },
                    { $expr: { $eq: ["$CUSTOMER_ID", "$$customer_id"] } },
                  ],
                },
              },
            ],
            as: "TEACHER_NAME",
          },
        },
      ])
      .toArray();
      
    const formatDateDMY = (date) => {
      // console.log("datedatedate", date);
      let tempDate = date.toISOString().split("T");

      let datePart = tempDate[0].match(/\d+/g);

      let year = datePart[0];

      let month = datePart[1];

      let day = datePart[2];
      console.log("Dates", day + "/" + month + "/" + year);

      return day + "/" + month + "/" + year;
    };
    if (data.length > 0) {
      data.map((val) => {
        val.COURSE_NAME = val.COURSE_NAME[0].COURSE_NAME;
        val.BATCH_NAME = val.BATCH_NAME[0].BATCH_NAME;
        val.STUDENT_NAME = val.STUDENT_NAME[0].USER_FULLNAME;
        val.TEACHER_NAME = val.TEACHER_NAME[0].USER_FULLNAME;
        // val.DATE = formatDateDMY(val.DATE);
      });
    }

    if (data.length > 0) {
      if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data;
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter((val) => val.TEACHER_ID == TEACHER_ID);
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter((val) => val.USER_ID == STUDENT_ID);
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter((val) => val.COURSE_ID == COURSE_ID);
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter((val) => val.BATCH_NO == BATCH_NO);
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter((val) => val.ATTENDANCE.toUpperCase() == STATUS);
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) => val.TEACHER_ID == TEACHER_ID && val.USER_ID == STUDENT_ID
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) => val.TEACHER_ID == TEACHER_ID && val.COURSE_ID == COURSE_ID
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) => val.TEACHER_ID == TEACHER_ID && val.BATCH_NO == BATCH_NO
        );
        // res.send(data_1);
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) => val.USER_ID == STUDENT_ID && val.COURSE_ID == COURSE_ID
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) => val.USER_ID == STUDENT_ID && val.BATCH_NO == BATCH_NO
        );
        // res.send(data_1);
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID && val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) => val.COURSE_ID == COURSE_ID && val.BATCH_NO == BATCH_NO
        );
        // res.send(data_1);
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.COURSE_ID == COURSE_ID && val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.COURSE_ID == COURSE_ID &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.BATCH_NO == BATCH_NO && val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.BATCH_NO == BATCH_NO &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.BATCH_NO == BATCH_NO
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.COURSE_ID == COURSE_ID &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.BATCH_NO == BATCH_NO &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.BATCH_NO == BATCH_NO &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.COURSE_ID == COURSE_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.BATCH_NO == BATCH_NO &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.BATCH_NO == BATCH_NO &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      }

      //--
      else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE == "" &&
        END_DATE == ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS == "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID == "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      } else if (
        TEACHER_ID != "" &&
        STUDENT_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STATUS != "" &&
        START_DATE != "" &&
        END_DATE != ""
      ) {
        data_1 = data.filter(
          (val) =>
            val.TEACHER_ID == TEACHER_ID &&
            val.USER_ID == STUDENT_ID &&
            val.COURSE_ID == COURSE_ID &&
            val.BATCH_NO == BATCH_NO &&
            val.ATTENDANCE.toUpperCase() == STATUS &&
            new Date(val.DATE) >= new Date(START_DATE) &&
            new Date(val.DATE) <= new Date(END_DATE)
        );
      }
      // data_1.map((val) => {
      //   val.DATE = formatDateDMY(val.DATE);
      // });
      res.send(data_1);
    } else {
      res.send([]);
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
