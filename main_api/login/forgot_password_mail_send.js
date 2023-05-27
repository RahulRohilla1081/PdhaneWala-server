var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const hat = require("hat");
var nodemailer = require("nodemailer");
const constants = require("../constants/constants");

const SUPPORT_EMAIL_ID = constants.SUPPORT_EMAIL_ID;
const HOST_URL_RESET_PASSWORD = constants.HOST_URL_RESET_PASSWORD;
const SUPPORT_EMAIL_PASSWORD = constants.SUPPORT_EMAIL_PASSWORD;
const PDHANE_WALA_IMG = constants.PDHANE_WALA_IMG;
const RESET_PASSWORD_IMAGE = constants.RESET_PASSWORD_IMAGE;
const BETACODE_LOGO = constants.BETACODE_LOGO;

/*   
API url: - 
http://localhost:9000/main_api/login/forgot_password_mail_send
payload:-
{
    "USER_EMAIL":"joyeeta41@gmail.com"
    
}
*/

router.post("/", async function (req, res, next) {
  try {
    let USER_EMAIL = await req.body.USER_EMAIL;
    let db = await dbConnect();
    let RESET_PASSWORD_TOKEN = hat();
    let data = await db
      .collection("user_db")
      .find({ USER_EMAIL: USER_EMAIL })
      .toArray();
    let fromMail = SUPPORT_EMAIL_ID;
    let password = SUPPORT_EMAIL_PASSWORD;

    function sendMail(toMail, user_name, reset_pss_token) {
      var transporter = nodemailer.createTransport({
        service: "gmail", //comment this if using support portal

        //Remove comment if you're using support portal id
        //   host: "smtp-mail.outlook.com",
        //   port: 587,
        //   secure: false,

        auth: {
          user: fromMail,
          pass: password,
        },
      });

      var mailOptions = {
        from: fromMail,
        to: toMail,

        subject: "Reset Password",

        html:
          "<body style='background-color: #f3f2f0;'> <table align='center' border='0' cellpadding='0' cellspacing='0' width='550' bgcolor='white' style='box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition: 0.3s; width: 550px;' > <td align='center'> <div style='align-items: flex-start; display: flex;'> <img src=" +
          PDHANE_WALA_IMG +
          " width='120'/> </div> <h4 style='text-align: left; align-items: center; margin-left: 15px;'>Hello " +
          user_name +
          "</h4> <p style='text-align: center;padding: 10px;'>You have requested to change your password</p> <p style='text-align: center;'> Click on Reset Password below </p> <p class='data' style='text-align: justify-all; align-items: center; font-size: 15px; padding-bottom: 12px;'> </p> <img src=" +
          RESET_PASSWORD_IMAGE +
          " width='550'/> <a href=" +
          HOST_URL_RESET_PASSWORD +
          reset_pss_token +
          " style='background-color: #fe1873; /* Green */ border: none; color: white; text-align: center; text-decoration: none; display: inline-block; font-size: 20px; font-weight: 700; width: 150px; padding:10px; margin-top: 20px;border-radius: 10px;'> Reset Password </a> <p style='text-align: left;margin-left: 15px;'>If you have any trouble logging in or using the application, write to us at <a href=''>support@betacode.com</a> <p style='text-align: left;font-weight: 700;margin-left: 15px;'> Note: The link will expire after used once for password reset. </p> <img src=" +
          BETACODE_LOGO +
          " width='70'/> <p>© 2023 BetaCode. All Rights Reserved.</p> <div style='margin-bottom: 20px;'> <a href='#' target='_blank' style='color:#000; text-decoration:none;'>Privacy Policy</a> | <a href='#' target='_blank' style='color:#000; text-decoration:none;'>Terms Of Service</a> </div> </td> </table> </body>",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log({
            msg: "fail",
            error: error,
          });

          if (error.responseCode == 432) {
            sendMail(toMail, user_name, reset_pss_token);
          } else {
            res.send({
              Message: "Mailing error",
              mailSent: false,
              emailIdExists: true,
            });
          }
        } else {
          console.log({
            EMPLOYEE_ID: user_name,
            info: info,
            RESET_PASSWORD_TOKEN: reset_pss_token,
          });
          if (data[0].ROLE_ID.some((val) => val == "CUSTOMER")) {
            db.collection("user_login").updateOne(
              { USER_ID: data[0].USER_ID },
              { $set: { RESET_PASSWORD_TOKEN: RESET_PASSWORD_TOKEN } }
            );
          } else {
            db.collection("user_login").updateOne(
              { USER_ID: data[0].USER_ID, CUSTOMER_ID: data[0].CUSTOMER_ID },
              { $set: { RESET_PASSWORD_TOKEN: RESET_PASSWORD_TOKEN } }
            );
          }
        }
      });
    }
    if (data.length > 0) {
      sendMail(USER_EMAIL, data[0].USER_FULLNAME, RESET_PASSWORD_TOKEN);

      res.send({
        Message: "Mail sent and reset password token updated",
        mailSent: true,
        emailIdExists: true,
      });
    } else {
      res.send({
        Message: "emailID does not exist",
        mailSent: false,
        emailIdExists: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
