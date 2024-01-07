var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const dbConnectLocal = require("../../db_local");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/testing/db_backup
*/

router.post("/", async function (req, res, next) {
  try {
    let db = await dbConnect();
    let dbLocal = await dbConnectLocal();
    let originalDb = [
      "attendance",
      "batch_master",
      "certificate_template",
      "course_master",
      "notifications",
      "sessions",
      "user_db",
      "user_login",
    ];

    originalDb.map(async (val) => {
      // db.collection(val).deleteMany();
      let data = await db.collection(val).find().toArray();
      dbLocal.collection(val).deleteMany();
      if (data.length > 0) {
        dbLocal.collection(val).insertMany(data);
      }
    });

    res.send("backup taken");
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
