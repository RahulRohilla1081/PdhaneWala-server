var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/notifications/notifications_update
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "NOTIFICATION_ID":"N00000003",
    "NOTIFICATION_TITLE":"Title",
    "DESCRIPTION":"Notification",
    "NOTIFICATION_TIME":"Fri May 19 2023 01:00:00 GMT+0530",
    "IS_ACTIVE":false,
    "RECEIVER_DATA":[{
        "USER_ID":"PWS00001",
        "IS_SEEN":true
    },
    {
        "USER_ID":"PWT001",
        "IS_SEEN":true
    }]   
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    formData.NOTIFICATION_TIME = new Date(formData.NOTIFICATION_TIME);

    
    db.collection("notifications").replaceOne(
      {
        CUSTOMER_ID: formData.CUSTOMER_ID,
        NOTIFICATION_ID: formData.NOTIFICATION_ID,
      },
      { ...formData }
    );

    res.send({
      server_status: res.statusCode,
      message: "Notification updated",
    });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
