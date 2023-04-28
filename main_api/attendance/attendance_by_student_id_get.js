var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/attendance/attendance_by_student_id_get?CUSTOMER_ID=PWC0000001&USER_ID=PWS00002
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let USER_ID = req.query.USER_ID;
    let db = await dbConnect();
    var data = await db
      .collection("attendance")
      .aggregate([
        { $match: { CUSTOMER_ID: CUSTOMER_ID } },
        { $match: { USER_ID: USER_ID } },
        {
          $lookup: {
            from: "course_master",
            localField: "COURSE_ID",
            foreignField: "COURSE_ID",
            as: "COURSE_NAME",
          },
        },
        {
          $lookup: {
            from: "batch_master",
            localField: "BATCH_NO",
            foreignField: "BATCH_NO",
            as: "BATCH_NAME",
          },
        },
      ])
      .toArray();
    console.log(data);
    data.map((val) => {
      val.COURSE_NAME = val.COURSE_NAME[0].COURSE_NAME;
      val.BATCH_NAME = val.BATCH_NAME[0].BATCH_NAME;
    });

    var data_1 = await db
      .collection("user_db")
      .aggregate([
        {
          $match: {
            CUSTOMER_ID: CUSTOMER_ID,
            USER_ID: USER_ID,
          },
        },
        { $unwind: "$STUDENT_COURSE" },
        {
          $lookup: {
            from: "batch_master",
            localField: "STUDENT_COURSE.BATCH_NO",
            foreignField: "BATCH_NO",
            as: "BATCH_NAME",
          },
        },
        {
          $lookup: {
            from: "course_master",
            localField: "STUDENT_COURSE.COURSE_ID",
            foreignField: "COURSE_ID",
            as: "COURSE_NAME",
          },
        },
        {
          $lookup: {
            from: "user_db",
            localField: "CUSTOMER_ID",
            foreignField: "USER_ID",
            as: "CUSTOMER_NAME",
          },
        },
        { $unwind: "$BATCH_NAME" },
        { $unwind: "$COURSE_NAME" },
        { $unwind: "$CUSTOMER_NAME" },
      ])
      .toArray();
    // res.send(data_1);
    var student_data = [];
    if (data_1.length > 0) {
      data_1[0].STUDENT_COURSE.CUSTOMER_ID = data_1[0].LOGIN_CUSTOMER_ID;
      data_1[0].STUDENT_COURSE.STUDENT_ID = data_1[0].STUDENT_ID;
      data_1[0].STUDENT_COURSE.COURSE_NAME = data_1[0].COURSE_NAME.COURSE_NAME;
      data_1[0].STUDENT_COURSE.BATCH_NAME = data_1[0].BATCH_NAME.BATCH_NAME;
      data_1[0].STUDENT_COURSE.CUSTOMER_NAME =
        data_1[0].CUSTOMER_NAME.CUSTOMER_FULLNAME;
      delete data_1[0].STUDENT_COURSE.ASSIGNED_FEE;
      delete data_1[0].STUDENT_COURSE.START_DATE;
      delete data_1[0].STUDENT_COURSE.END_DATE;
      delete data_1[0].STUDENT_COURSE.RECEIVED_FEE;
      student_data = [data_1[0].STUDENT_COURSE];
    }

    res.send({ attendance_data: data, student_data: student_data });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
