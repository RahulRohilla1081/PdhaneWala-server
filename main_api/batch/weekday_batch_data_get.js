var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/batch/weekday_batch_data_get?CUSTOMER_ID=PWC0000001&WEEKDAY=Monday
*/

router.get("/", async function (req, res, next) {
  try {
    let WEEKDAY = req.query.WEEKDAY;
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let db = await dbConnect();

    var weekdayRegex = new RegExp(WEEKDAY, "i");

    var weekdayBatches = await db
      .collection("batch_master")
      .aggregate([
        { $match: { CUSTOMER_ID: CUSTOMER_ID } },
        { $unwind: "$BATCH_TIMING" },
        { $match: { "BATCH_TIMING.BATCH_DAY": { $regex: weekdayRegex } } },
        { $project: { _id: 0 } },
      ])
      .toArray();

    var weekdayBatchNo = [];
    weekdayBatches.map((batch) => {
      weekdayBatchNo.push(batch.BATCH_NO);
    });

    weekdayStudentData = await db
      .collection("user_db")
      .aggregate([
        { $match: { CUSTOMER_ID: CUSTOMER_ID } },
        { $unwind: "$STUDENT_COURSE" },
        { $match: { "STUDENT_COURSE.BATCH_NO": { $in: weekdayBatchNo } } },
      ])
      .project({ _id: 0 })
      .toArray();
    weekdayBatches.map((val) => {
      var FilteredStudent = weekdayStudentData.filter(
        (student) => student.BATCH_NO == val.BATCH_NO
      );
      val.STUDENT_COUNT = FilteredStudent.length;
    });

    res.send(weekdayBatches);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
