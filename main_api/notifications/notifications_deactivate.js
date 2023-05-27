var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/notifications/notifications_deactivate
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "NOTIFICATION_ID":"N00000001"
    "IS_ACTIVE":false    
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    db.collection("notifications").updateOne(
      {
        CUSTOMER_ID: formData.CUSTOMER_ID,
        NOTIFICATION_ID: formData.NOTIFICATION_ID,
      },
      { $set: { IS_ACTIVE: formData.IS_ACTIVE } }
    );
    res.send({
      server_status: res.statusCode,
      message: "Notification deactivated",
    });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
