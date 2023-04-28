var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/student/student_course_completed_update
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "USER_ID":"S00002",
    "COURSE_ID":"C001"   
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    db.collection("user_db").updateOne(
      {
        CUSTOMER_ID: formData.CUSTOMER_ID,
        USER_ID: formData.USER_ID,
        "STUDENT_COURSE.COURSE_ID": formData.COURSE_ID,
      },
      { $set: { "STUDENT_COURSE.$.IS_COMPLETE": true } }
    );

    res.send({ Status: "Update data success" });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
