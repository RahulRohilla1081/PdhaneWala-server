var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/attendance/attendance_create
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "USER_ID":"PWS00002",
    "COURSE_ID":"C001",
    "BATCH_NO":"B001",
    "DATE":"2023-03-23",
    "ATTENDANCE":"P" 
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    var insertData = {
      CUSTOMER_ID: formData.CUSTOMER_ID,
      USER_ID: formData.USER_ID,
      DATE: formData.DATE,
      COURSE_ID: formData.COURSE_ID,
      BATCH_NO: formData.BATCH_NO,
      ATTENDANCE: formData.ATTENDANCE,
    };
    db.collection("attendance").insertOne(insertData);
    res.send("Attendance created");
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
