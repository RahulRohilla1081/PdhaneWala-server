const express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const hat = require("hat");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/* 
API url: -     
http://localhost:9000/main_api/login/signupUser_gmail

payload:-
{
"USER_EMAIL" : "rahul.rohilla1081@gmail.com",
"USER_FULLNAME":"Rahul Rohilla",
"GENDER":"Male",
 "IP_ADDRESS":"127.0.0.1",
   "USER_DEVICE" :"Iphone 14 Pro max",
   "LAST_ACTIVITY" : "160636232"
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    let VERIFY_USER_TOKEN = hat();
    var USER_ID = "";

    //----------------Customer ID creation------------------

    let data = await db.collection("user_db").find().toArray();
    let user_data = [];
    data.map((element) => {
      if (
        element.USER_EMAIL == formData.USER_EMAIL &&
        element.IS_ACTIVE == true &&
        element.IS_REMOVED == false
      ) {
        user_data.push(element);
      }
    });

    if (data.length > 0) {
      var customer = data.filter((val) => val.USER_ID.includes("PWC"));
      var sorted = customer.sort((a, b) => b.USER_ID.localeCompare(a.USER_ID));
      let DataID = [sorted[0]];

      // let DataID = await db
      //   .collection("user_db")
      //   .aggregate([
      //     { $unwind: "$ROLE_ID" },
      //     { $match: { ROLE_ID: "CUSTOMER" } },
      //   ])
      //   .sort({ USER_ID: -1 })
      //   .limit(1)
      //   .toArray();
      ID = parseInt(DataID[0].USER_ID.substring(3)) + 1;
      ID = ID.toString().padStart(7, "0");
      USER_ID = "PWC" + ID;
    } else {
      USER_ID = "PWC0000001";
    }

    let insertData_1 = {
      USER_ID: USER_ID,
      USER_EMAIL: formData.USER_EMAIL,
      USER_FULLNAME: formData.USER_FULLNAME,
      GENDER: formData.GENDER,
      ROLE_ID: ["CUSTOMER"],
      DEFAULT_CERTIFICATE_TEMPLATE: "T01",
      IS_REMOVED: false,
      IS_ACTIVE: true,
    };

    let insertData_2 = {
      USER_ID: USER_ID,
      ROLE_ID: ["CUSTOMER"],
      VERIFY_USER_TOKEN: VERIFY_USER_TOKEN,
      IS_VERIFIED: true,
      IS_REMOVED: false,
      IS_ACTIVE: true,
    };
    //----------------Insert existing user's session data in DB-----------------------

    if (user_data.length > 0) {
      if (user_data[0].USER_ID.includes("PWC")) {
        var insertData = {
          USER_ID: user_data[0].USER_ID,
          SESSION_ID: req.session.id,
          IP_ADDRESS: formData.IP_ADDRESS,
          USER_DEVICE: formData.USER_DEVICE,
          LAST_ACTIVITY: formData.LAST_ACTIVITY,
          IS_LOGOUT: false,
        };
      } else {
        insertData = {
          USER_ID: user_data[0].USER_ID,
          CUSTOMER_ID: user_data[0].CUSTOMER_ID,
          SESSION_ID: req.session.id,
          IP_ADDRESS: formData.IP_ADDRESS,
          USER_DEVICE: formData.USER_DEVICE,
          LAST_ACTIVITY: formData.LAST_ACTIVITY,
          IS_LOGOUT: false,
        };
      }

      db.collection("user_login").updateOne(
        { USER_ID: user_data[0].USER_ID },
        { $set: { IS_VERIFIED: true } }
      );

      db.collection("sessions").insertOne(insertData);
      // insertData.ROLE_ID = user_data[0].ROLE_ID;
      let session_data = {
        ...insertData,
        ROLE_ID: user_data[0].ROLE_ID,
        INSTITUTE_NAME: user_data[0].INSTITUTE_NAME,
        INSTITUTE_ADDRESS: user_data[0].INSTITUTE_ADDRESS,
        LOGO_URL: user_data[0].LOGO_URL,
      };

      res.send({
        message: "Email ID already registered",
        already_registered: true,
        session_data: session_data,
      });
    } else {
      //-----------Insert new customer data and session data in db---------

      var insertData_3 = {
        USER_ID: USER_ID,
        SESSION_ID: req.session.id,
        IP_ADDRESS: formData.IP_ADDRESS,
        USER_DEVICE: formData.USER_DEVICE,
        LAST_ACTIVITY: formData.LAST_ACTIVITY,
        IS_LOGOUT: false,
      };
      db.collection("user_db").insertOne(insertData_1);
      db.collection("user_login").insertOne(insertData_2);
      db.collection("sessions").insertOne(insertData_3);
      // insertData_3.ROLE_ID = ["CUSTOMER"];
      let session_data = { ...insertData_3, ROLE_ID: ["CUSTOMER"] };
      res.send({
        Status: "New customer created",
        already_registered: false,
        session_data: session_data,
      });
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
