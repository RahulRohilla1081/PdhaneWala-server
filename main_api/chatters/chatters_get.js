var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/chatters/chatters_get?CUSTOMER_ID=PWC0000001&USER_ID=PWS00001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let USER_ID = req.query.USER_ID;
    let db = await dbConnect();
    let student_data = [];
    let teachers_data = [];

    let user_data = await db
      .collection("user_db")
      .find({ CUSTOMER_ID: CUSTOMER_ID, USER_ID: USER_ID })
      .toArray();

    if (user_data[0].CUSTOMER_ID == undefined) {

      student_data = await db
        .collection("user_db")
        .find({
          CUSTOMER_ID: USER_ID,
          ROLE_ID: "STUDENT",
          // ROLE_ID: { $in: ["STUDENT"] },
        })
        .project({
          CUSTOMER_ID: 1,
          USER_ID: 1,
          USER_FULLNAME: 1,
          _id: 0,
          USER_PROFILE_URL: 1,
        })
        .toArray();
      teachers_data = await db
        .collection("user_db")
        .find({
          CUSTOMER_ID: USER_ID,
          ROLE_ID: { $in: ["TEACHER"] },
        })
        .project({
          CUSTOMER_ID: 1,
          USER_ID: 1,
          USER_FULLNAME: 1,
          _id: 0,
          USER_PROFILE_URL: 1,
        })
        .toArray();
    } else {
      if (user_data.length > 0 && user_data[0].ROLE_ID.includes("STUDENT")) {
        let user_batches = [];
        let user = user_data[0];
        user.STUDENT_COURSE.map((val) => {
          user_batches.push(val.BATCH_NO);
        });
        let batchSet = [...new Set(user_batches)];
        console.log("batchSet", batchSet);
        let batchData = await db
          .collection("batch_master")
          .find({ CUSTOMER_ID: CUSTOMER_ID, BATCH_NO: { $in: batchSet } })
          .toArray();
        console.log("mybatch", batchData);
        let teachers = [];
        batchData.map((val) => {
          teachers.push(val.TEACHER_ID);
        });
        teachers_data = await db
          .collection("user_db")
          .find({ CUSTOMER_ID: CUSTOMER_ID, USER_ID: { $in: teachers } })
          .project({
            CUSTOMER_ID: 1,
            USER_ID: 1,
            USER_FULLNAME: 1,
            _id: 0,
            USER_PROFILE_URL: 1,
          })
          .toArray();
        // res.send({ student: 0, teachers: teachers_data });
      }
      if (user_data.length > 0 && user_data[0].ROLE_ID.includes("TEACHER")) {
        let teacher_batch = await db
          .collection("batch_master")
          .find({ TEACHER_ID: USER_ID })
          .toArray();
        let batchArr = [];
        teacher_batch.map((val) => {
          batchArr.push(val.BATCH_NO);
        });
        let batchSet = [...new Set(batchArr)];
        student_data = await db
          .collection("user_db")
          .find({
            CUSTOMER_ID: CUSTOMER_ID,
            STUDENT_COURSE: {
              $elemMatch: { BATCH_NO: { $in: batchSet } },
            },
          })
          .project({
            CUSTOMER_ID: 1,
            USER_ID: 1,
            USER_FULLNAME: 1,
            _id: 0,
            USER_PROFILE_URL: 1,
          })
          .toArray();
      }
    }

    res.send({ student: student_data, teachers: teachers_data });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
