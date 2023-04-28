var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/teacher/teacher_get_by_customer_id?CUSTOMER_ID=PWC0000001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let db = await dbConnect();

    let data_teacher = await db
      .collection("user_db")
      .aggregate([
        { $match: { CUSTOMER_ID: CUSTOMER_ID } },
        { $unwind: "$ROLE_ID" },
        { $match: { ROLE_ID: "TEACHER" } },
      ])
      .toArray();

    res.send(data_teacher);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
