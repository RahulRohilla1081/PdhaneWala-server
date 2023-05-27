var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/student/student_get_by_customer_id?CUSTOMER_ID=PWC0000001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let db = await dbConnect();

    let data_student = await db
      .collection("user_db")
      .aggregate([
        { $match: { CUSTOMER_ID: CUSTOMER_ID } },
        { $unwind: "$ROLE_ID" },
        { $match: { ROLE_ID: "STUDENT" } },
      ])
      .toArray();
    let course_data = await db
      .collection("course_master")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      .toArray();
    let batch_data = await db
      .collection("batch_master")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      .toArray();
    data_student.map((val) => {
      val.STUDENT_COURSE.map((innerval) => {
        var filtered_course = course_data.filter(
          (course) => course.COURSE_ID == innerval.COURSE_ID
        );
        // console.log("filtered_course", filtered_course);
        innerval.COURSE_NAME = filtered_course[0].COURSE_NAME;
        var filtered_batch = batch_data.filter(
          (batch) => batch.BATCH_NO == innerval.BATCH_NO
        );
        innerval.BATCH_NAME = filtered_batch[0].BATCH_NAME;
      });
    });

    res.send(data_student);

    // data_student.map((val) => {
    //   if (val.CUSTOMER_ID == val.COURSE_NAME.CUSTOMER_ID) {
    //     val.COURSE_ID = val.STUDENT_COURSE.COURSE_ID;
    //     val.COURSE_NAME = val.COURSE_NAME.COURSE_NAME;
    //   } else {
    //     delete val.COURSE_NAME;
    //   }
    //   if (val.CUSTOMER_ID == val.BATCH_NAME.CUSTOMER_ID) {
    //     val.BATCH_NO = val.STUDENT_COURSE.BATCH_NO;
    //     val.BATCH_NAME = val.BATCH_NAME.BATCH_NAME;
    //   } else {
    //     delete val.BATCH_NAME;
    //   }
    //   delete val.STUDENT_COURSE;
    // });

    // res.send(data_student);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
