var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/course/course_get_by_customerID?CUSTOMER_ID=PWC0000001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let db = await dbConnect();
    let data = await db
      .collection("course_master")
      .find({
        CUSTOMER_ID: CUSTOMER_ID,
        IS_ACTIVE: true,
        IS_REMOVED: false,
      })
      .toArray();
    // let data2 = await db.collection("batch_master").find().toArray()
    // res.send({course:[...data1],batch:[...data2]})
    let data_student = await db
      .collection("user_db")
      .aggregate([
        { $match: { CUSTOMER_ID: CUSTOMER_ID } },
        { $unwind: "$ROLE_ID" },
        { $match: { ROLE_ID: "STUDENT" } },
      ])
      .toArray();
    COURSE_DURATION_YY_MM_DD = [];
    data.map((val) => {
      var STUDENT_COUNT = 0;
      years = Math.floor(parseInt(val.COURSE_DURATION_DAYS) / 365);
      months = Math.floor((parseInt(val.COURSE_DURATION_DAYS) % 365) / 30);
      days = (parseInt(val.COURSE_DURATION_DAYS) % 365) % 30;
      COURSE_DURATION_YY_MM_DD = [years, months, days];
      // delete val.COURSE_DURATION_DAYS;
      val.COURSE_DURATION_YY_MM_DD = COURSE_DURATION_YY_MM_DD;
      if (data_student.length > 0) {
        data_student.map((innerval) => {
          if (
            innerval.STUDENT_COURSE.some(
              (item) => item.COURSE_ID == val.COURSE_ID
            )
          ) {
            STUDENT_COUNT += 1;
          }
        });
      }

      val.STUDENT_COUNT = STUDENT_COUNT;
    });
    res.send(data);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
