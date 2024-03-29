var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/student/student_get
*/

router.get("/", async function (req, res, next) {
  try {
    let db = await dbConnect();
    data = await db
      .collection("user_db")
      .aggregate([{ $unwind: "$ROLE_ID" }, { $match: { ROLE_ID: "STUDENT" } }])
      .project({ _id: 0 })
      .toArray();
    res.send(data);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
