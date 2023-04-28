const express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
var nodemailer = require("nodemailer");
const dbConnect = require("../../db");
const hat = require("hat");
const constants = require("../constants/constants");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

const HOST_URL_VERIFY_USER = constants.HOST_URL_VERIFY_USER;
const COMPANY_NAME = constants.COMPANY_NAME;
const DOMAIN_URL = constants.DOMAIN_URL;
const SUPPORT_EMAIL_ID = constants.SUPPORT_EMAIL_ID;
const RESET_PASSWORD_IMAGE = constants.RESET_PASSWORD_IMAGE;

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
    // const HashedPassword = bcrypt.hashSync(formData.PASSWORD, 10);

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
      DEFAULT_CERTIFICATE_TEMPLATE: "T01",
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

    //----------------Check if user already exists

    if (data.some((val) => val.USER_EMAIL == formData.USER_EMAIL)) {
      let user = data.find(
        (element) => element.USER_EMAIL == formData.USER_EMAIL
      );
      res.send({
        message: "Email ID already registered",
        already_registered: true,
        ROLE_ID: user.ROLE_ID,
      });
    } else {
      //-----------send verification mail if the user has not signed-up through verified Gmail account---------

      let fromMail = "rahul.rohilla1081@gmail.com";
      let password = "vzhkliuwvyfsyast";
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
            "<body style='background-color: #f3f2f0;'> <table align='center' border='0' cellpadding='0' cellspacing='0' width='550' bgcolor='white' style='box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition: 0.3s; width: 550px;' > <tbody> <tr> <td align='center'> <table align='center' border='0' cellpadding='0' cellspacing='0' class='col-550' width='550'> <tbody> </tbody> </table> </td> </tr> <tr style='display: inline-block; text-align: center;'> <td style='height: 150px; padding: 20px; border: none; background-color: white;'> <h3 style='background-color: #7c72dc ;color: white; height: 30px; text-align: center;align-items: center; '>Greetings from Timesheet! </h3> <h4 style='text-align: left; align-items: center;'>Hello " +
            user_name +
            ", <br> </h4> <p style='text-align: left;'> Timesheet provides you access to your Timesheet for projects and tasks assigned by your Project Manager. Please take a moment to reset your password. <br> </p> <p style='text-align: center;'> Click on Reset Password below </p> <p class='data' style='text-align: justify-all; align-items: center; font-size: 15px; padding-bottom: 12px;'> </p> <img src='' width='550px' height='400px'/> <br> <a href='" +
            HOST_URL_VERIFY_USER +
            verify_user_token +
            "' style='background-color: #7c72dc; /* Green */ border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 30px; font-weight: 700; width: 150px; height: 30px; margin-top: 20px; '> Reset Password </a> <p> or paste the following link into your browser </p> <a href='" +
            HOST_URL_VERIFY_USER +
            verify_user_token +
            "'>" +
            HOST_URL_VERIFY_USER +
            verify_user_token +
            "</a> <p> After changing the password, you can login using the link: </p> <a href='" +
            DOMAIN_URL +
            "'>" +
            DOMAIN_URL +
            "</a><p>If you have any trouble logging in or using the application, write to us at <a href='" +
            SUPPORT_EMAIL_ID +
            "'>" +
            SUPPORT_EMAIL_ID +
            "</a> We will revert to you and help you with your queries. </p> <p style='text-align: left;font-weight: 700;'> Note: The link will expire after used once for password reset. </p> </td> </tr> <tr style='border: none; background-color: #7c72dc; height: 40px; color:white; padding-bottom: 20px; text-align: center;'> <td height='100px' align='center'> <img src='http://localhost:9000/student_ID_S0007.png' width='550px' height='400px'/><br> </td> </tr> <tr> <td style='font-family:'Open Sans', Arial, sans-serif; font-size:11px; line-height:18px; color:#999999;' valign='top' align='center'> <a href='#' target='_blank' style='color:#999999; text-decoration:underline;'>PRIVACY STATEMENT</a> | <a href='#' target='_blank' style='color:#999999; text-decoration:underline;'>TERMS OF SERVICE</a> | <a href='#' target='_blank' style='color:#999999; text-decoration:underline;'>RETURNS</a><br>" +
            COMPANY_NAME +
            "<br> </td> </tr> </tbody></table></td> </tr> <tr> <td class='em_hide' style='line-height:1px; min-width:700px; background-color:#ffffff;'> <img alt='' src='images/spacer.gif' style='max-height:1px; min-height:1px; display:block; width:700px; min-width:700px;' width='700' border='0' height='1'> </td> </tr> </tbody> </table> </body>",
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
