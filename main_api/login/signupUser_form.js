const express = require("express");
var router = express.Router();
var nodemailer = require("nodemailer");
const dbConnect = require("../../db");
const hat = require("hat");
const constants = require("../constants/constants");
const PW_CERTIFICATE_TEMPLATES =
  require("../constants/pw_certificate_templates").PW_CERTIFICATE_TEMPLATES;
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

const HOST_URL_VERIFY_USER = constants.HOST_URL_VERIFY_USER;
const COMPANY_NAME = constants.COMPANY_NAME;
const DOMAIN_URL = constants.DOMAIN_URL;
const SUPPORT_EMAIL_ID = constants.SUPPORT_EMAIL_ID;
const SUPPORT_EMAIL_PASSWORD = constants.SUPPORT_EMAIL_PASSWORD;
const RESET_PASSWORD_IMAGE = constants.RESET_PASSWORD_IMAGE;
const PDHANE_WALA_IMG = constants.PDHANE_WALA_IMG;
const CONFIRM_ACCOUNT_IMG = constants.CONFIRM_ACCOUNT_IMG;
const BETACODE_LOGO = constants.BETACODE_LOGO;

/* 
API url: -     
http://localhost:9000/main_api/login/signupUser_form

payload:-
{
"USER_EMAIL" : "rahul.rohilla1081@gmail.com",
"USER_FULLNAME":"Rahul Rohilla",
"GENDER":"Male",
"PASSWORD" :"abcd"
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    let VERIFY_USER_TOKEN = hat();
    var USER_ID = "";

    //----------------Customer ID creation------------------

    let data = await db
      .collection("user_db")
      .aggregate([{ $unwind: "$ROLE_ID" }, { $match: { ROLE_ID: "CUSTOMER" } }])
      .toArray();

    if (data.length > 0) {
      var sorted = data.sort((a, b) => b.USER_ID.localeCompare(a.USER_ID));
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

    //----------------Data for insert-----------------------

    let insertData_1 = {
      USER_ID: USER_ID,
      USER_EMAIL: formData.USER_EMAIL,
      USER_FULLNAME: formData.USER_FULLNAME,
      GENDER: formData.GENDER,
      ROLE_ID: ["CUSTOMER"],
      DEFAULT_CERTIFICATE_TEMPLATE: PW_CERTIFICATE_TEMPLATES[0],
      IS_REMOVED: false,
      IS_ACTIVE: true,
    };

    let insertData_2 = {
      USER_ID: USER_ID,
      PASSWORD: formData.PASSWORD,
      ROLE_ID: ["CUSTOMER"],
      VERIFY_USER_TOKEN: VERIFY_USER_TOKEN,
      IS_VERIFIED: false,
      IS_REMOVED: false,
      IS_ACTIVE: true,
    };

    //----------------Check if user already exists-----------
    let data_user = await db
      .collection("user_db")
      .find({ USER_EMAIL: formData.USER_EMAIL })
      .toArray();
    if (data_user.length > 0) {
      // if (data.some((val) => val.USER_EMAIL == formData.USER_EMAIL)) {
      // let user = data.find(
      //   (element) => element.USER_EMAIL == formData.USER_EMAIL
      // );
      res.send({
        message: "Email ID already registered",
        already_registered: true,
        ROLE_ID: data_user[0].ROLE_ID,
      });
    } else {
      //-----------send verification mail if the user has not signed-up through verified Gmail account---------

      let fromMail = SUPPORT_EMAIL_ID;
      let password = SUPPORT_EMAIL_PASSWORD;
      // let password = "abcd";

      function sendMail(toMail, user_name, verify_user_token) {
        var transporter = nodemailer.createTransport({
          service: "gmail",

          //Remove comment if you're using support portal id
          // host: "smtp-mail.outlook.com",
          // port: 587,
          // secure: false,

          auth: {
            user: fromMail,
            pass: password,
          },
        });

        var mailOptions = {
          from: fromMail,
          to: toMail,

          subject: "Verify Email",

          html:
            "<body style='background-color: #f3f2f0'> <table align='center' border='0' cellpadding='0' cellspacing='0' width='550' bgcolor='white' style=' box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); transition: 0.3s; width: 550px; ' > <td align='center'> <h4 style='text-align: left; align-items: center; margin-left: 15px'> Hello " +
            user_name +
            " </h4> <p style='text-align: center; padding: 10px'> Thank you for creating your account with PdhaneWala, </p> <p style='text-align: center'>Click on Confirm Account below</p> <p class='data' style=' text-align: justify-all; align-items: center; font-size: 15px; padding-bottom: 12px; ' ></p>  <a href=" +
            HOST_URL_VERIFY_USER +
            verify_user_token +
            " style=' background-color: #9f4e9a; /* Green */ border: none; color: white; text-align: center; text-decoration: none; display: inline-block; font-size: 20px; font-weight: 700; width: 150px; padding: 10px; margin-top: 20px; border-radius: 10px; ' >Confirm Account</a > <p style='text-align: left; margin-left: 15px'> If you have any trouble logging in or using the application, write to us at <a href='' >support@betacode.com</a > </p> <p style='text-align: left; font-weight: 700; margin-left: 15px'> Note: The link will expire after used once for password reset. </p> <img src=" +
            BETACODE_LOGO +
            " style='width: 70px;' /> <p>© 2023 BetaCode. All Rights Reserved.</p> <div style='margin-bottom: 20px'> <a href='#' target='_blank' style='color: #000; text-decoration: none' >Privacy Policy</a > | <a href='#' target='_blank' style='color: #000; text-decoration: none' >Terms Of Service</a > </div> </td> </table></body>",
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log({
              msg: "fail",
              error: error,
            });
            res.send(error);
          } else if (!error) {
            db.collection("user_db").insertOne(insertData_1);
            db.collection("user_login").insertOne(insertData_2);
            res.send({
              message: "Customer created",
              mailSent: 1,
              already_registered: false,
              USER_ID: insertData_1.USER_ID,
            });
          }
        });
      }

      sendMail(formData.USER_EMAIL, formData.USER_FULLNAME, VERIFY_USER_TOKEN);
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
