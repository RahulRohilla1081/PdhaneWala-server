var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/student/student_by_batch_get?BATCH_NO=B001&CUSTOMER_ID=PWC0000001
*/

router.get("/", async function (req, res, next) {
  try {
    let BATCH_NO = req.query.BATCH_NO;
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    console.log(BATCH_NO);
    let db = await dbConnect();

    let data = await db
      .collection("user_db")
      .aggregate([
        { $unwind: "$STUDENT_COURSE" },
        {
          $match: {
            CUSTOMER_ID: CUSTOMER_ID,
            "STUDENT_COURSE.BATCH_NO": { $eq: BATCH_NO },
            IS_REMOVED: false,
            IS_ACTIVE: true,
          },
        },
        {
          $project: {
            _id: 0,
            "STUDENT_COURSE.BATCH_NO": 1,
            "STUDENT_COURSE.START_DATE": 1,
            "STUDENT_COURSE.END_DATE": 1,
            "STUDENT_COURSE.RECEIVED_FEE": 1,
            USER_ID: 1,
            USER_FULLNAME: 1,
            USER_EMAIL: 1,
            USER_CONTACT: 1,
          },
        },
      ])
      .toArray();
    // res.send(data);

    let batch = await db
      .collection("batch_master")
      .find({ BATCH_NO: BATCH_NO, CUSTOMER_ID: CUSTOMER_ID })
      .project({ _id: 0 })
      .toArray();
    var student_data = [];
    data.map((val) => {
      student = {};
      student = { ...val, ...val.STUDENT_COURSE };
      delete student.STUDENT_COURSE;
      student_data.push(student);
    });

    res.send({ students: student_data, batch: batch });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
