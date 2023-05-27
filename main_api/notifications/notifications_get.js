var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/notifications/notifications_get?CUSTOMER_ID=PWC0000001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let db = await dbConnect();
    let data = await db
      .collection("notifications")
      .aggregate([
        // { $unwind: "$RECEIVER_DATA" },
        { $match: { CUSTOMER_ID: CUSTOMER_ID } },
      ])
      .project({ _id: 0 })
      .toArray();
    let user_data = await db
      .collection("user_db")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      .toArray();
    data.map((val) => {
      val.NOTIFICATION_TIME = val.NOTIFICATION_TIME.toLocaleString();
      val.RECEIVER_DATA.map((receiver) => {
        receiver.NOTIFICATION_SEEN_TIME =
          receiver.NOTIFICATION_SEEN_TIME.toLocaleString();
        user_data.map((user) => {
          if (user.USER_ID == receiver.USER_ID) {
            receiver.USER_FULLNAME = user.USER_FULLNAME;
          }
        });
      });
    });
    console.log("data", CUSTOMER_ID, data);
    res.send(data);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
