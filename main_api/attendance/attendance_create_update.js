var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/attendance/attendance_create_update
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "USER_ID":"PWS00002",
    "COURSE_ID":"C001",
    "BATCH_NO":"B001",
    "TEACHER_ID":"PWT001",
    "DATE":"2023-03-23",
    "ATTENDANCE":"Present",
    "IS_APPROVED":"PENDING"
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    let data = await db
      .collection("attendance")
      .find({
        CUSTOMER_ID: formData.CUSTOMER_ID,
        USER_ID: formData.USER_ID,
        COURSE_ID: formData.COURSE_ID,
        BATCH_NO: formData.BATCH_NO,
        DATE: new Date(formData.DATE),
      })
      .toArray();
    if (data.length > 0) {
      db.collection("attendance").updateOne(
        {
          CUSTOMER_ID: formData.CUSTOMER_ID,
          USER_ID: formData.USER_ID,
          COURSE_ID: formData.COURSE_ID,
          BATCH_NO: formData.BATCH_NO,
          TEACHER_ID: formData.TEACHER_ID,
          DATE: new Date(formData.DATE),
          IS_APPROVED: formData.IS_APPROVED,
        },
        {
          $set: {
            ATTENDANCE: formData.ATTENDANCE,
          },
        }
      );
    } else {
      var insertData = {
        CUSTOMER_ID: formData.CUSTOMER_ID,
        USER_ID: formData.USER_ID,
        DATE: new Date(formData.DATE),
        COURSE_ID: formData.COURSE_ID,
        BATCH_NO: formData.BATCH_NO,
        TEACHER_ID: formData.TEACHER_ID,
        ATTENDANCE: formData.ATTENDANCE,
        IS_APPROVED: formData.IS_APPROVED,
        IS_RESUBMITTED: false,
      };
      db.collection("attendance").insertOne(insertData);
    }
    res.send("Attendance created/updated");
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
