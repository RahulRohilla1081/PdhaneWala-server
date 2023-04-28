const express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*
API url: - 
http://localhost:9000/main_api/login/profile_password_update

payload:-
{
   "USER_ID" :"PWS00001" ,
   "CUSTOMER_ID" :"PWC0000002" ,
   "PASSWORD" :"qfMHcAE0Z5Ry4BBoBzN_9R8yylYSpiSw"
}
*/

router.post("/", async (req, res) => {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    if (formData.CUSTOMER_ID) {
      db.collection("user_login").updateOne(
        { USER_ID: formData.USER_ID, CUSTOMER_ID: formData.CUSTOMER_ID },
        { $set: { PASSWORD: formData.PASSWORD } }
      );
      res.send("Password Updated");
    } else {
      db.collection("user_login").updateOne(
        { USER_ID: formData.USER_ID },
        { $set: { PASSWORD: formData.PASSWORD } }
      );
      res.send("Password Updated");
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
