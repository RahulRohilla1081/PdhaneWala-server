var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/course/course_update
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "COURSE_ID":"C001",
    "COURSE_NAME":"React JS",
    "STANDARD_FEE":"2400",
    "COURSE_DURATION_YEAR":"0",
    "COURSE_DURATION_MONTHS":"3",
    "COURSE_DURATION_DAYS":"3"    
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    let COURSE_DURATION_DAYS =
      parseInt(formData.COURSE_DURATION_YEAR) * 365 +
      parseInt(formData.COURSE_DURATION_MONTHS) * 30 +
      parseInt(formData.COURSE_DURATION_DAYS);

    let updateData = {
      COURSE_NAME: formData.COURSE_NAME,
      STANDARD_FEE: formData.STANDARD_FEE,
      COURSE_DURATION_DAYS: COURSE_DURATION_DAYS,
    };

    db.collection("course_master").updateOne(
      {
        CUSTOMER_ID: formData.CUSTOMER_ID,
        COURSE_ID: formData.COURSE_ID,
      },
      { $set: updateData }
    );

    res.send({ Status: "Update data success" });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
