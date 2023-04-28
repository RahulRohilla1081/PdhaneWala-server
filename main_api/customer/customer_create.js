//This API will not be required as customer gets created in signupUser API
var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/customer/customer_create
payload:-
{
    "CUSTOMER_EMAIL":"abc@email.com",
    "CUSTOMER_FULLNAME":"Rahul",
    "PASSWORD":"abcd"
}
*/

//This API will not be required as customer gets created in signupUser API

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    var CUSTOMER_ID = "";
    let data = await db.collection("customer_db").find().toArray();
    // let data = await db.collection("batch_master").find({}).sort({"BATCH_NO" : -1}).limit(1).toArray()

    if (data.length > 0) {
      let DataID = await db
        .collection("customer_db")
        .find({})
        .sort({ CUSTOMER_ID: -1 })
        .limit(1)
        .toArray();
      ID = parseInt(DataID[0].CUSTOMER_ID.substring(3)) + 1;
      ID = ID.toString().padStart(5, "0");
      CUSTOMER_ID = "CUS" + ID;
    } else {
      CUSTOMER_ID = "CUS00001";
    }

    let insertData = {
      CUSTOMER_ID: CUSTOMER_ID,
      CUSTOMER_EMAIL: formData.CUSTOMER_EMAIL,
      CUSTOMER_FULLNAME: formData.CUSTOMER_FULLNAME,
      PASSWORD: formData.PASSWORD,
    };

    db.collection("customer_db").insertOne(insertData);

    res.send({ Status: "Insert data success" });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
