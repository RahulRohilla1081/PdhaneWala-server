var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/login/active_sessions_get_by_userID?USER_ID=PWC0000002&CUSTOMER_ID=
*/

router.get("/", async function (req, res, next) {
  try {
    let USER_ID = req.query.USER_ID;
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let db = await dbConnect();

    if (CUSTOMER_ID) {
      var data = await db
        .collection("sessions")
        .find({ USER_ID: USER_ID, CUSTOMER_ID: CUSTOMER_ID, IS_LOGOUT: false })
        .toArray();
    } else {
      var data = await db
        .collection("sessions")
        .find({ USER_ID: USER_ID, IS_LOGOUT: false })
        .toArray();
    }
    res.send(data);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
