var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/batch/batch_get_by_customerID?CUSTOMER_ID=PWC0000001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let db = await dbConnect();
    let data_batch = await db
      .collection("batch_master")
      .aggregate([
        {
          $match: {
            CUSTOMER_ID: CUSTOMER_ID,
            IS_ACTIVE: true,
            IS_REMOVED: false,
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
    let data_student = await db
      .collection("user_db")
      .aggregate([
        {
          $match: {
            CUSTOMER_ID: CUSTOMER_ID,
            IS_ACTIVE: true,
            IS_REMOVED: false,
          },
        },
        { $unwind: "$ROLE_ID" },
        { $match: { ROLE_ID: "STUDENT" } },
      ])
      .toArray();
    let data_course = await db
      .collection("course_master")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      .toArray();

    data_batch.map((val) => {
      val.TEACHER_NAME = val.TEACHER_NAME[0].USER_FULLNAME;
      val.TOTAL_STUDENTS = 0;
      let batch_student = data_student.filter((student) =>
        student.STUDENT_COURSE.some((batch) => batch.BATCH_NO == val.BATCH_NO)
      );
      data_student.map((innerval) => {
        innerval.STUDENT_COURSE.map((courseVal) => {
          if (val.BATCH_NO == courseVal.BATCH_NO) {
            val.TOTAL_STUDENTS = batch_student.length;
          }
        });
      });
      let course_array = [];
      val.COURSE.map((course_id) => {
        let course_obj = {};
        data_course.map((data) => {
          if (course_id == data.COURSE_ID) {
            course_obj.COURSE_ID = course_id;
            course_obj.COURSE_NAME = data.COURSE_NAME;
          }
        });
        course_array.push(course_obj);
      });
      val.COURSE = course_array;
    });
    res.send(data_batch);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
