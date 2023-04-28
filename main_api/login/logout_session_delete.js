const express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*
API url: - 
http://localhost:9000/main_api/login/logout_session_delete

payload:-
{
   "SESSION_ID" :"qfMHcAE0Z5Ry4BBoBzN_9R8yylYSpiSw",
   "SESSION_TYPE" :"SINGLE",
   "USER_ID" :"S0004" 
}
*/

router.post("/", async (req, res) => {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    if (formData.SESSION_TYPE.toUpperCase() == "SINGLE") {
      db.collection("sessions").updateOne(
        { SESSION_ID: formData.SESSION_ID },
        { $set: { IS_LOGOUT: true } }
      );
      res.send("Single session logged out");
    } else if (formData.SESSION_TYPE.toUpperCase() == "MULTIPLE") {
      db.collection("sessions").updateMany(
        { USER_ID: formData.USER_ID },
        { $set: { IS_LOGOUT: true } }
      );
      res.send("Multiple session logged out");
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
