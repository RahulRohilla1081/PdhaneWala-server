//API wont be used as it s combined for customer and student
var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const bcrypt = require("bcrypt");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/login/login_validate_session_create
payload:-
{
    "USER_EMAIL":"rahul.rohilla1081@gmail.com",
    "PASSWORD":"abcd",
     "IP_ADDRESS":"127.0.0.1",
   "USER_DEVICE" :"Iphone 14 Pro max",
   "LAST_ACTIVITY" : "160636232"
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    console.log(req.session);
    let db = await dbConnect();
    var customerFlag;
    console.log("PASSWORD", formData.PASSWORD);

    var data = await db
      .collection("user_db")
      .find({
        USER_EMAIL: formData.USER_EMAIL,
        IS_ACTIVE: true,
        IS_REMOVED: false,
      })
      .project({ _id: 0 })
      .toArray();

    if (data.length > 0) {
      if (data[0].USER_ID.includes("PWC")) {
        customerFlag = true;
        var data_1 = await db
          .collection("user_login")
          .find({ USER_ID: data[0].USER_ID, IS_VERIFIED: true })
          .toArray();
        console.log("data_1", data_1);

        var certificate_template = await db
          .collection("user_db")
          .find({ USER_ID: data[0].USER_ID })
          .toArray();
      } else {
        customerFlag = false;
        var data_1 = await db
          .collection("user_login")
          .find({
            CUSTOMER_ID: data[0].CUSTOMER_ID,
            USER_ID: data[0].USER_ID,
            IS_PASSWORD_RESET: true,
          })
          .toArray();
      }

      if (data_1.length > 0) {
        if (data[0].USER_ID.includes("PWC")) {
          var insertData = {
            USER_ID: data_1[0].USER_ID,
            SESSION_ID: req.session.id,
            IP_ADDRESS: formData.IP_ADDRESS,
            USER_DEVICE: formData.USER_DEVICE,
            LAST_ACTIVITY: formData.LAST_ACTIVITY,
            IS_LOGOUT: false,
          };
        } else {
          insertData = {
            USER_ID: data_1[0].USER_ID,
            SESSION_ID: req.session.id,
            IP_ADDRESS: formData.IP_ADDRESS,
            USER_DEVICE: formData.USER_DEVICE,
            LAST_ACTIVITY: formData.LAST_ACTIVITY,
            CUSTOMER_ID: data_1[0].CUSTOMER_ID,
            IS_LOGOUT: false,
          };
        }
        bcrypt.compare(
          formData.PASSWORD,
          data_1[0].PASSWORD,
          (err, isMatch) => {
            if (err) {
              throw err;
            } else if (!isMatch) {
              console.log("Password didn't match");
              res.send({
                message: "Incorrect Password",
                idError: 0,
                passwordError: 1,
                isVerifiedError: 0,
                isPasswordResetError: 0,
              });
            } else {
              db.collection("sessions").insertOne(insertData);
              // db.collection("customer_db").insertOne({ROLE_ID:["ADMIN"]})45
              let user_data = data;
              user_data[0].IP_ADDRESS = formData.IP_ADDRESS;
              user_data[0].USER_DEVICE = formData.USER_DEVICE;
              user_data[0].LAST_ACTIVITY = formData.LAST_ACTIVITY;
              user_data[0].ROLE_ID = data_1[0].ROLE_ID;
              user_data[0].IS_LOGOUT = false;
              if (data[0].ROLE_ID.some((val) => val == "CUSTOMER")) {
                user_data[0].DEFAULT_CERTIFICATE_TEMPLATE =
                  certificate_template[0].DEFAULT_CERTIFICATE_TEMPLATE;
              }

              res.send({
                message: "Correct credentials",
                idError: 0,
                passwordError: 0,
                isVerifiedError: 0,
                isPasswordResetError: 0,
                SESSION_ID: req.session.id,
                login_data: user_data,
              });
            }
          }
        );
      } else {
        if (customerFlag) {
          res.send({
            message: "User not verified",
            idError: 0,
            passwordError: 0,
            isVerifiedError: 1,
            isPasswordResetError: 0,
          });
        } else {
          res.send({
            message: "Password not reset",
            idError: 0,
            passwordError: 0,
            isVerifiedError: 0,
            isPasswordResetError: 1,
          });
        }
      }
    } else {
      res.send({
        message: "User not registered",
        idError: 1,
        passwordError: 0,
        isVerifiedError: 0,
        isPasswordResetError: 0,
      });
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
