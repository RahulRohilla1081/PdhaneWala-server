var express = require("express");
var router = express.Router();
const dbConnect = require("../../../db");
const axios_function_all_APIs_catch = require("../../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/attendance/attendance_approval/attendance_approve_reject
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
      "IS_APPROVED":"Approved",
    "ATTENDANCE_DATA": [{
      "USER_ID":"PWS00001",
      "DATE": "2023-05-14",
      "COURSE_ID":"C001",
      "BATCH_NO":"B001"
    },{
      "USER_ID":"PWS00001",
      "DATE": "2023-05-15",
      "COURSE_ID":"C001",
      "BATCH_NO":"B001"
    }]
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    formData.ATTENDANCE_DATA.map((val) => {
      db.collection("attendance").updateOne(
        {
          CUSTOMER_ID: formData.CUSTOMER_ID,
          USER_ID: val.USER_ID,
          DATE: new Date(val.DATE),
          COURSE_ID: val.COURSE_ID,
          BATCH_NO: val.BATCH_NO,
        },
        { $set: { IS_APPROVED: formData.IS_APPROVED } }
      );
    });

    res.send({ Server_status: res.statusCode, Message: "Attendance updated" });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
