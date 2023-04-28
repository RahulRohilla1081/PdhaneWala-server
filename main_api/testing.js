var express = require("express");
var router = express.Router();
const dbConnect = require("../db");

/*   
API url: - 
http://localhost:9000/main_api/testing
*/

router.post("/", async function (req, res, next) {
  let db = await dbConnect();
  // db.collection("course_master").insertOne({
  //   course: JSON.parse(req.body.DATA),
  // });
  // var data= await db.collection("customer_db").aggregate([{$match:{CUSTOMER_EMAIL:"rahul.rohilla1081@gmail.com"}}]).toArray()
  // let data = await db.collection("student_master").updateMany({},{$set:{ROLE_ID:["STUDENT"]}})
  // await db.collection("certificate_template").deleteMany()
  // await db.collection("user_db").deleteMany();
  // await db.collection("user_login").deleteMany();
  // await db.collection("sessions").deleteMany();
  // await db.collection("course_master").deleteMany();
  // await db.collection("batch_master").deleteMany();
  // await db.collection("user_login").deleteMany({ IS_PASSWORD_RESET :{$in:[true,false]}});
  // db.collection("course_master").updateMany(
  //   {},
  //   { $set: { IS_ACTIVE: true, IS_REMOVED: false } }
  // );
  // db.collection("batch_master").updateMany(
  //   {},
  //   { $set: { IS_ACTIVE: true, IS_REMOVED: false } }
  // );

  res.send("Completed");
});

module.exports = router;
