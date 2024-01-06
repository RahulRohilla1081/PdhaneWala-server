var express = require("express");
var router = express.Router();
const dbConnect = require("../db");

/*   
API url: - 
http://localhost:9000/main_api/testing
*/

router.post("/", async function (req, res, next) {
  let db = await dbConnect();
  let data = await db
    .collection("users")
    .aggregate([
      {
        $lookup: {
          from: "teacher_allocation",

          localField: "student_id",

          foreignField: "student_id",

          as: "teacher_allocation",
        },
      },

      { $unwind: "$teacher_allocation" },

      {
        $lookup: {
          from: "teachers",

          localField: "teacher_allocation.teacher_id",

          foreignField: "teacher_id",

          as: "teachers",
        },
      },

      { $unwind: "$teachers" },

      {
        $match: {
          "teachers.name": "Jane",
        },
      },
    ])
    .toArray();

  let janeData = await db
    .collection("teachers")
    .find({ name: "Jane" })
    .toArray();
  let allocData = await db
    .collection("teacher_allocation")
    .find({ teacher_id: janeData[0].teacher_id })
    .toArray();
  let final = await db
    .collection("users")
    .find({ student_id: { $in: allocData[0].student_id } })
    .toArray();

  res.send(data);
});

module.exports = router;
