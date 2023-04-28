var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/student/student_fee_update
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "USER_ID":"PWS00001",
    "COURSE_ID":"C001",
    "RECEIVED_FEE":{"DATE":"2023-04-20","AMOUNT":1000}
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    // let data = await db.collection("student_course").find({LOGIN_CUSTOMER_ID:formData.LOGIN_CUSTOMER_ID, STUDENT_ID:formData.STUDENT_ID, COURSE_ID:formData.COURSE_ID}).toArray()

    let data = await db
      .collection("user_db")
      .aggregate([
        { $match: { CUSTOMER_ID: formData.CUSTOMER_ID } },
        { $match: { USER_ID: formData.USER_ID } },
        { $unwind: "$STUDENT_COURSE" },
        { $match: { "STUDENT_COURSE.COURSE_ID": formData.COURSE_ID } },
      ])
      .toArray();
    // res.send(data)

    if (data.length > 0) {
      db.collection("user_db").updateOne(
        {
          CUSTOMER_ID: formData.CUSTOMER_ID,
          USER_ID: formData.USER_ID,
          "STUDENT_COURSE.COURSE_ID": formData.COURSE_ID,
        },
        { $push: { "STUDENT_COURSE.$.RECEIVED_FEE": formData.RECEIVED_FEE } }
      );

      // db.collection("student_course").updateOne({LOGIN_CUSTOMER_ID:formData.LOGIN_CUSTOMER_ID, STUDENT_ID:formData.STUDENT_ID, COURSE_ID:formData.COURSE_ID}, {$set: {RECEIVED_FEE:received_fee}})

      res.send({ Status: "Update data success" });
    } else {
      res.send("This student doesn't exist");
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
