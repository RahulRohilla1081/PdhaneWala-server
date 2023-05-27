var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/notifications/notifications_seen_update
payload:-
{
  "CUSTOMER_ID":"PWC0000001",
  "USER_ID":"PWS00001",
  "NOTIFICATION_ID":[{
    "NOTIFICATION_ID":"N00000001",
    "NOTIFICATION_SEEN_TIME":"Fri May 19 2023 01:00:00 GMT+0530"
  },{
    "NOTIFICATION_ID":"N00000002",
    "NOTIFICATION_SEEN_TIME":"Fri May 19 2023 01:00:00 GMT+0530"
  }]      
  }
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    formData.NOTIFICATION_ID.map((data) => {
      let date = new Date(data.NOTIFICATION_SEEN_TIME);
      db.collection("notifications").updateOne(
        {
          NOTIFICATION_ID: data.NOTIFICATION_ID,
          CUSTOMER_ID: formData.CUSTOMER_ID,
          "RECEIVER_DATA.USER_ID": formData.USER_ID,
        },
        {
          $set: {
            "RECEIVER_DATA.$.IS_SEEN": true,
            "RECEIVER_DATA.$.NOTIFICATION_SEEN_TIME": date,
          },
        }
      );
    });

    // formData.map((data) => {
    //   db.collection("notifications").updateOne(
    //     {
    //       NOTIFICATION_ID: data.NOTIFICATION_ID,
    //       CUSTOMER_ID: data.CUSTOMER_ID,
    //       "RECEIVER_DATA.USER_ID": data.USER_ID,
    //     },
    //     { $set: { "RECEIVER_DATA.$.IS_SEEN": true } }
    //   );
    // });
    res.send({
      server_status: res.statusCode,
      message: "Notification updated to seen",
    });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
