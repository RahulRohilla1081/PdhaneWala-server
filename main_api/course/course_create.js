var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/course/course_create
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "COURSE_NAME":"React JS",
    "STANDARD_FEE":"2300",
    "COURSE_DURATION_YEAR":"0",
    "COURSE_DURATION_MONTHS":"2",
    "COURSE_DURATION_DAYS":"3"    
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    let data = await db
      .collection("course_master")
      .find({ CUSTOMER_ID: formData.CUSTOMER_ID })
      .toArray();
    // let data = await db.collection("batch_master").find({}).sort({"BATCH_NO" : -1}).limit(1).toArray()
    var COURSE_ID = "";
    if (data.length > 0) {
      var sorted = data.sort((a, b) => b.COURSE_ID.localeCompare(a.COURSE_ID));
      let DataID = [sorted[0]];
      //    let DataID = await db.collection("course_master").find({}).sort({"COURSE_ID" : -1}).limit(1).toArray()
      ID = parseInt(DataID[0].COURSE_ID.substring(1)) + 1;
      ID = ID.toString().padStart(3, "0");
      COURSE_ID = "C" + ID;
    } else {
      COURSE_ID = "C001";
    }

    let COURSE_DURATION_DAYS =
      parseInt(formData.COURSE_DURATION_YEAR) * 365 +
      parseInt(formData.COURSE_DURATION_MONTHS) * 30 +
      parseInt(formData.COURSE_DURATION_DAYS);

    // let db = await dbConnect();
    let insertData = {
      COURSE_ID: COURSE_ID,
      COURSE_NAME: formData.COURSE_NAME,
      STANDARD_FEE: formData.STANDARD_FEE,
      COURSE_DURATION_DAYS: COURSE_DURATION_DAYS,
      CUSTOMER_ID: formData.CUSTOMER_ID,
      IS_ACTIVE: true,
      IS_REMOVED: false,
    };

    db.collection("course_master").insertOne(insertData);

    //  data = await db.collection("course_master").find().toArray();
    res.send({ Status: "Insert data success" });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
