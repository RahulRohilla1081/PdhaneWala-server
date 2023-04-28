var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/batch/batch_update
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "BATCH_NO":"B001",
    "BATCH_NAME":"STAR",
    "BATCH_LIMIT":"10",
    "BATCH_TYPE":"Offline",
    "BATCH_TIMING":[{"BATCH_DAY":"MONDAY","BATCH_TIME":"5 PM"},{"BATCH_DAY":"WEDNESDAY","BATCH_TIME":"7 PM"},{"BATCH_DAY":"FRIDAY","BATCH_TIME":"7 PM"}]   
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    let updateData = {
      BATCH_NAME: formData.BATCH_NAME,
      BATCH_LIMIT: formData.BATCH_LIMIT,
      BATCH_TYPE: formData.BATCH_TYPE,
      BATCH_TIMING: formData.BATCH_TIMING,
    };

    db.collection("batch_master").updateOne(
      {
        CUSTOMER_ID: formData.CUSTOMER_ID,
        BATCH_NO: formData.BATCH_NO,
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
