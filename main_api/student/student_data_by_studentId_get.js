var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/student/student_data_by_studentId_get?CUSTOMER_ID=PWC0000001&USER_ID=PWS00001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let USER_ID = req.query.USER_ID;
    let db = await dbConnect();

    var data = await db
      .collection("user_db")
      .aggregate([
        { $match: { CUSTOMER_ID: { $eq: CUSTOMER_ID } } },
        { $match: { USER_ID: { $eq: USER_ID } } },
        { $project: { _id: 0 } },
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
    data.map((val) => {
      val.STUDENT_COURSE.map((innerval) => {
        var filtered_course = course_data.filter(
          (course) => course.COURSE_ID == innerval.COURSE_ID
        );
        innerval.COURSE_NAME = filtered_course[0].COURSE_NAME;
        var filtered_batch = batch_data.filter(
          (batch) => batch.BATCH_NO == innerval.BATCH_NO
        );
        innerval.BATCH_NAME = filtered_batch[0].BATCH_NAME;
      });
    });

    res.send(data);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;

//need course_name, received_fees
