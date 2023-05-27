var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/batch/batch_create
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "BATCH_NAME":"MOON",
    "BATCH_LIMIT":"10",
    "BATCH_TYPE":"Offline",
    "BATCH_LIMIT":"1",
    "COURSE":[C001,C002],
    "TEACHER_ID":"PWT001",
   "BATCH_TIMING":[{"BATCH_DAY":"MONDAY","BATCH_TIME":"7 PM"},{"BATCH_DAY":"WEDNESDAY","BATCH_TIME":"7 PM"},{"BATCH_DAY":"FRIDAY","BATCH_TIME":"7 PM"}]   
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    var BATCH_NO = "";
    let data = await db
      .collection("batch_master")
      .find({ CUSTOMER_ID: formData.CUSTOMER_ID })
      .toArray();
    // let data = await db.collection("batch_master").find({}).sort({"BATCH_NO" : -1}).limit(1).toArray()
    

    if (data.length > 0) {
      var sorted = data.sort((a, b) => b.BATCH_NO.localeCompare(a.BATCH_NO));
      let DataID = [sorted[0]];
      // let DataID = await db
      //   .collection("batch_master")
      //   .find({})
      //   .sort({ BATCH_NO: -1 })
      //   .limit(1)
      //   .toArray();
      ID = parseInt(DataID[0].BATCH_NO.substring(1)) + 1;
      ID = ID.toString().padStart(3, "0");
      BATCH_NO = "B" + ID;
    } else {
      BATCH_NO = "B001";
    }

    let insertData = {
      BATCH_NO: BATCH_NO,
      BATCH_NAME: formData.BATCH_NAME,
      BATCH_TYPE: formData.BATCH_TYPE,
      BATCH_LIMIT: formData.BATCH_LIMIT,
      BATCH_TIMING: formData.BATCH_TIMING,
      CUSTOMER_ID: formData.CUSTOMER_ID,
      TEACHER_ID: formData.TEACHER_ID,
      COURSE: formData.COURSE,
      IS_ACTIVE: true,
      IS_REMOVED: false,
    };

    db.collection("batch_master").insertOne(insertData);
    // data = await db.collection("batch_master").find({}).toArray();

    res.send({ Status: "Insert data success" });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
