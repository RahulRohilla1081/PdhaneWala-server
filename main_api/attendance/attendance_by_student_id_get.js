//CHatGPT APIKEY = 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
var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/attendance/attendance_by_student_id_get?CUSTOMER_ID=PWC0000001&USER_ID=PWS00001&IS_APPROVED=Pending&ATTENDANCE=Present&START_DATE=2023-02-11&END_DATE=2023-05-30
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let USER_ID = req.query.USER_ID;
    let IS_APPROVED = req.query.IS_APPROVED;
    let ATTENDANCE = req.query.ATTENDANCE;
    let START_DATE = req.query.START_DATE;
    let END_DATE = req.query.END_DATE;
    let db = await dbConnect();

    let customer_data = await db
      .collection("user_db")
      .find({ USER_ID: CUSTOMER_ID })
      .toArray();

    let user_data = await db
      .collection("user_db")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      .toArray();

    var data = await db
      .collection("attendance")
      .aggregate([
        {
          $match: {
            CUSTOMER_ID: CUSTOMER_ID,
            USER_ID: USER_ID,
            IS_APPROVED: IS_APPROVED,
            ATTENDANCE: ATTENDANCE,
          },
        },

        {
          $match: {
            DATE: {
              $gte: new Date(START_DATE),
              $lte: new Date(END_DATE),
            },
          },
        },
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
      ])
      .toArray();

    console.log("TEST", data);
    data.map((val) => {
      val.COURSE_NAME = val.COURSE_NAME[0].COURSE_NAME;
      // val.TEACHER_ID = val.BATCH_NAME[0].TEACHER_ID;
      val.BATCH_NAME = val.BATCH_NAME[0].BATCH_NAME;
      val.INSTITUTE_NAME = customer_data[0].INSTITUTE_NAME;
      user_data.map((innerval) => {
        if (val.TEACHER_ID == innerval.USER_ID) {
          val.TEACHER_NAME = innerval.USER_FULLNAME;
        }
      });
    });

    var data_1 = await db
      .collection("user_db")
      .find({
        CUSTOMER_ID: CUSTOMER_ID,
        USER_ID: USER_ID,
      })
      .toArray();
    console.log(data_1);
    let batch_data = await db.collection("batch_master").find().toArray();
    let course_data = await db.collection("course_master").find().toArray();

    // res.send(data_1);
    if (data_1.length > 0) {
      data_1[0].STUDENT_COURSE.map((val) => {
        batch_data.map((batch) => {
          if (batch.BATCH_NO == val.BATCH_NO) {
            val.BATCH_NAME = batch.BATCH_NAME;
            user_data.map((user) => {
              if (batch.TEACHER_ID == user.USER_ID) {
                val.TEACHER_ID = user.USER_ID;
                val.TEACHER_NAME = user.USER_FULLNAME;
              }
            });
          }
          course_data.map((course) => {
            if (course.COURSE_ID == val.COURSE_ID) {
              val.COURSE_NAME = course.COURSE_NAME;
            }
          });
        });
      });
      data_1[0].CUSTOMER_NAME = customer_data[0].USER_FULLNAME;
      var student_data = {};

      student_data.CUSTOMER_ID = data_1[0].CUSTOMER_ID;
      student_data.CUSTOMER_NAME = data_1[0].CUSTOMER_NAME;
      student_data.USER_ID = data_1[0].USER_ID;
      student_data.STUDENT_COURSE = data_1[0].STUDENT_COURSE;

      student_data.STUDENT_COURSE.map((val) => {
        delete val.ASSIGNED_FEE;
        delete val.RECEIVED_FEE;
      });
    }

    res.send({ attendance_data: data, student_data: [student_data] });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
