var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const hat = require("hat");
var nodemailer = require("nodemailer");
const constants = require("../constants/constants");

const HOST_URL_RESET_PASSWORD = constants.HOST_URL_RESET_PASSWORD;
const COMPANY_NAME = constants.COMPANY_NAME;
const DOMAIN_URL = constants.DOMAIN_URL;
const SUPPORT_EMAIL_ID = constants.SUPPORT_EMAIL_ID;
const SUPPORT_EMAIL_PASSWORD = constants.SUPPORT_EMAIL_PASSWORD;

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
          "<body style='background-color: #f3f2f0;'> <table align='center' border='0' cellpadding='0' cellspacing='0' width='550' bgcolor='white' style='box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition: 0.3s; width: 550px;' > <tbody> <tr> <td align='center'> <table align='center' border='0' cellpadding='0' cellspacing='0' class='col-550' width='550'> <tbody> </tbody> </table> </td> </tr> <tr style='display: inline-block; text-align: center;'> <td style='height: 150px; padding: 20px; border: none; background-color: white;'> <h3 style='background-color: #7c72dc ;color: white; height: 30px; text-align: center;align-items: center; '>Greetings from Timesheet! </h3> <h4 style='text-align: left; align-items: center;'>Hello " +
          user_name +
          ", <br> </h4> <p style='text-align: left;'> Timesheet provides you access to your Timesheet for projects and tasks assigned by your Project Manager. Please take a moment to reset your password. <br> </p> <p style='text-align: center;'> Click on Reset Password below </p> <p class='data' style='text-align: justify-all; align-items: center; font-size: 15px; padding-bottom: 12px;'> </p> <img src=''/> <br> <a href='" +
          HOST_URL_RESET_PASSWORD +
          reset_pss_token +
          "' style='background-color: #7c72dc; /* Green */ border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 30px; font-weight: 700; width: 150px; height: 30px; margin-top: 20px; '> Reset Password </a> <p> or paste the following link into your browser </p> <a href='" +
          HOST_URL_RESET_PASSWORD +
          reset_pss_token +
          "'>" +
          HOST_URL_RESET_PASSWORD +
          reset_pss_token +
          "</a> <p> After changing the password, you can login using the link: </p> <a href='" +
          DOMAIN_URL +
          "'>" +
          DOMAIN_URL +
          "</a><p>If you have any trouble logging in or using the application, write to us at <a href='" +
          SUPPORT_EMAIL_ID +
          "'>" +
          SUPPORT_EMAIL_ID +
          "</a> We will revert to you and help you with your queries. </p> <p style='text-align: left;font-weight: 700;'> Note: The link will expire after used once for password reset. </p> </td> </tr> <tr style='border: none; background-color: #7c72dc; height: 40px; color:white; padding-bottom: 20px; text-align: center;'> <td height='100px' align='center'> <img src=''/><br> </td> </tr> <tr> <td style='font-family:'Open Sans', Arial, sans-serif; font-size:11px; line-height:18px; color:#999999;' valign='top' align='center'> <a href='#' target='_blank' style='color:#999999; text-decoration:underline;'>PRIVACY STATEMENT</a> | <a href='#' target='_blank' style='color:#999999; text-decoration:underline;'>TERMS OF SERVICE</a> | <a href='#' target='_blank' style='color:#999999; text-decoration:underline;'>RETURNS</a><br>" +
          COMPANY_NAME +
          "<br> </td> </tr> </tbody></table></td> </tr> <tr> <td class='em_hide' style='line-height:1px; min-width:700px; background-color:#ffffff;'> <img alt='' src='images/spacer.gif' style='max-height:1px; min-height:1px; display:block; width:700px; min-width:700px;' width='700' border='0' height='1'> </td> </tr> </tbody> </table> </body>",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log({
            msg: "fail",
            error: error,
          });

          if (error.responseCode == 432) {
            sendMail(toMail, user_name, reset_pss_token);
          }
        } else {
          console.log({
            EMPLOYEE_ID: user_name,
            info: info,
            RESET_PASSWORD_TOKEN: reset_pss_token,
          });
        }
      });
    }

    sendMail(USER_EMAIL, data[0].USER_FULLNAME, RESET_PASSWORD_TOKEN);
    if (data[0].USER_ID.includes("PWC")) {
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
    res.send("Mail sent and reset password token updated");
  } catch (err) {
    console.log(err);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
