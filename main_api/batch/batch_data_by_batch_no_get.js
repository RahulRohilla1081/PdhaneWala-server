var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/batch/batch_data_by_batch_no_get?CUSTOMER_ID=PWC0000001&BATCH_NO=B001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let BATCH_NO = req.query.BATCH_NO;
    let db = await dbConnect();
    let data_batch = await db
      .collection("batch_master")
      .find({ CUSTOMER_ID: CUSTOMER_ID, BATCH_NO: BATCH_NO })
      .project({ _id: 0 })
      .toArray();

    let data_student = await db
      .collection("user_db")
      .aggregate([
        { $match: { CUSTOMER_ID: CUSTOMER_ID } },
        { $unwind: "$ROLE_ID" },
        { $match: { ROLE_ID: "STUDENT" } },
        { $unwind: "$STUDENT_COURSE" },
        { $match: { "STUDENT_COURSE.BATCH_NO": BATCH_NO } },
        // {$group:{_id:null,STUDENT_COURSE:{$addToSet:'$STUDENT_COURSE'}}},
        {
          $project: {
            CUSTOMER_ID: 1,
            USER_ID: 1,
            STUDENT_COURSE: 1,
            USER_FULLNAME: 1,
            USER_CONTACT: 1,
            USER_EMAIL: 1,
          },
        },
      ])
      .toArray();
    // console.log(data);
    var student_details = [];
    data_student.map((val) => {
      var student_object = {};
      student_object = {
        CUSTOMER_ID: val.CUSTOMER_ID,
        USER_ID: val.USER_ID,
        USER_FULLNAME: val.USER_FULLNAME,
        USER_CONTACT: val.USER_CONTACT,
        USER_EMAIL: val.USER_EMAIL,
        ...val.STUDENT_COURSE,
      };
      student_details.push(student_object);
    });
    let course_data = await db
      .collection("course_master")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      .toArray();
    student_details.map((val) => {
      var filtered_course = course_data.filter(
        (item) => item.COURSE_ID == val.COURSE_ID
      );
      val.COURSE_NAME = filtered_course[0].COURSE_NAME;
    });

    res.send({ BATCH_DETAILS: data_batch, STUDENT_DETAILS: student_details });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
