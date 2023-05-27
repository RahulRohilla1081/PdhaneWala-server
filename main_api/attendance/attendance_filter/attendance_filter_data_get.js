//CHatGPT APIKEY = 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
var express = require("express");
var router = express.Router();
const dbConnect = require("../../../db");
const axios_function_all_APIs_catch = require("../../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/attendance/attendance_filter/attendance_filter_data_get?CUSTOMER_ID=PWC0000001&TEACHER_ID=PWT001&COURSE_ID=&BATCH_NO=&STUDENT_ID=
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let TEACHER_ID = req.query.TEACHER_ID;
    let COURSE_ID = req.query.COURSE_ID;
    let BATCH_NO = req.query.BATCH_NO;
    let STUDENT_ID = req.query.STUDENT_ID;

    let data_filtered = [];
    let db = await dbConnect();

    let user_data = await db
      .collection("user_db")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      .toArray();
    let batch_data = await db
      .collection("batch_master")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      // .project({ BATCH_NO: 1, BATCH_NAME: 1, _id: 0 })
      .toArray();

    let course_data = await db
      .collection("course_master")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      // .project({ COURSE_ID: 1, COURSE_NAME: 1, _id: 0 })
      .toArray();
    let teacher_data = [],
      student_data = [],
      course = [],
      batch = [];

    course_data.map((val) => {
      course.push({ COURSE_ID: val.COURSE_ID, COURSE_NAME: val.COURSE_NAME });
    });
    batch_data.map((val) => {
      batch.push({ BATCH_NO: val.BATCH_NO, BATCH_NAME: val.BATCH_NAME });
    });
    user_data.map((user) => {
      if (user.ROLE_ID.some((roleId) => roleId == "TEACHER")) {
        teacher_data.push({
          TEACHER_ID: user.USER_ID,
          TEACHER_NAME: user.USER_FULLNAME,
        });
      }
      if (user.ROLE_ID.some((roleId) => roleId == "STUDENT")) {
        student_data.push({
          STUDENT_ID: user.USER_ID,
          STUDENT_NAME: user.USER_FULLNAME,
        });
      }
    });

    if (
      TEACHER_ID == "" &&
      COURSE_ID == "" &&
      BATCH_NO == "" &&
      STUDENT_ID == ""
    ) {
      data_filtered = [
        {
          SERVER_STATUS: res.statusCode,
          TEACHER: teacher_data,
          COURSE: course,
          BATCH: batch,
          STUDENT: student_data,
        },
      ];
    } else if (
      TEACHER_ID != "" &&
      COURSE_ID == "" &&
      BATCH_NO == "" &&
      STUDENT_ID == ""
    ) {
      let BATCH_FILTER = batch_data.filter(
        (val) => val.TEACHER_ID == TEACHER_ID
      );
      let BATCH = [];
      BATCH_FILTER.map((val) => {
        BATCH.push({ BATCH_NO: val.BATCH_NO, BATCH_NAME: val.BATCH_NAME });
      });
      let COURSE = [];
      BATCH_FILTER.map((val) => {
        COURSE.push(...val.COURSE);
      });
      COURSE = [...new Set(COURSE)];
      let COURSE_FILTER = [];
      let STUDENT_FILTER = [];

      COURSE.map((val) => {
        course_data.map((innerval) => {
          if (val == innerval.COURSE_ID) {
            COURSE_FILTER.push({
              COURSE_ID: innerval.COURSE_ID,
              COURSE_NAME: innerval.COURSE_NAME,
            });
          }
        });
        user_data.map((student) => {
          if (
            student.ROLE_ID.some((val) => val == "STUDENT") &&
            student.STUDENT_COURSE.some(
              (student_val) => student_val.COURSE_ID == val
            )
          ) {
            STUDENT_FILTER.push({
              STUDENT_ID: student.USER_ID,
              STUDENT_NAME: student.USER_FULLNAME,
            });
          }
        });
      });

      data_filtered = [
        {
          SERVER_STATUS: res.statusCode,
          TEACHER: teacher_data,
          COURSE: COURSE_FILTER,
          BATCH: BATCH,
          STUDENT: STUDENT_FILTER,
        },
      ];
    } else if (
      (TEACHER_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STUDENT_ID == "") ||
      (TEACHER_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO == "" &&
        STUDENT_ID == "")
    ) {
      let BATCH_FILTER = batch_data.filter((val) =>
        val.COURSE.some((courseId) => courseId == COURSE_ID)
      );
      let STUDENT_FILTER = [];
      let BATCH = [];
      BATCH_FILTER.map((val) => {
        user_data.map((innerval) => {
          if (
            innerval.ROLE_ID.some((val) => val == "STUDENT") &&
            innerval.STUDENT_COURSE.some(
              (student_val) => student_val.BATCH_NO == val.BATCH_NO
            )
          ) {
            STUDENT_FILTER.push({
              STUDENT_ID: innerval.USER_ID,
              STUDENT_NAME: innerval.USER_FULLNAME,
            });
          }
        });
        BATCH.push({ BATCH_NO: val.BATCH_NO, BATCH_NAME: val.BATCH_NAME });
      });
      data_filtered = [
        {
          SERVER_STATUS: res.statusCode,
          TEACHER: teacher_data,
          COURSE: course,
          BATCH: BATCH,
          STUDENT: STUDENT_FILTER,
        },
      ];
    } else if (
      (TEACHER_ID == "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STUDENT_ID == "") ||
      (TEACHER_ID != "" &&
        COURSE_ID == "" &&
        BATCH_NO != "" &&
        STUDENT_ID == "") ||
      (TEACHER_ID == "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STUDENT_ID == "") ||
      (TEACHER_ID != "" &&
        COURSE_ID != "" &&
        BATCH_NO != "" &&
        STUDENT_ID == "")
    ) {
      let STUDENT_FILTER = [];
      user_data.map((val) => {
        if (
          val.ROLE_ID.some((roleId) => roleId == "STUDENT") &&
          val.STUDENT_COURSE.some(
            (student_val) => student_val.BATCH_NO == BATCH_NO
          )
        ) {
          STUDENT_FILTER.push({
            STUDENT_ID: val.USER_ID,
            STUDENT_NAME: val.USER_FULLNAME,
          });
        }
      });

      data_filtered = [
        {
          SERVER_STATUS: res.statusCode,
          TEACHER: teacher_data,
          COURSE: course,
          BATCH: batch,
          STUDENT: STUDENT_FILTER,
        },
      ];
    }

    res.send(data_filtered);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
