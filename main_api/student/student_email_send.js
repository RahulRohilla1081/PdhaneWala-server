var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const hat = require("hat");
const constants = require("../constants/constants");
const nodemailer = require("nodemailer");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

const HOST_URL_RESET_PASSWORD = constants.HOST_URL_RESET_PASSWORD;
const COMPANY_NAME = constants.COMPANY_NAME;
const DOMAIN_URL = constants.DOMAIN_URL;
const SUPPORT_EMAIL_ID = constants.SUPPORT_EMAIL_ID;
const SUPPORT_EMAIL_PASSWORD = constants.SUPPORT_EMAIL_PASSWORD;
/*   
API url: - 
http://localhost:9000/main_api/student/student_email_send
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "USER_ID":"PWS00001",
    "USER_EMAIL":"rahul.rohilla1081@gmail.com"
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    let fromMail = SUPPORT_EMAIL_ID;
    let password = SUPPORT_EMAIL_PASSWORD;
    let RESET_PASSWORD_TOKEN = hat();

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
            EMPLOYEE_ID: emp_id,
            info: info,
            RESET_PASSWORD_TOKEN: reset_pss_token,
          });
        }
      });
    }

    let data = await db
      .collection("user_db")
      .find({ CUSTOMER_ID: formData.CUSTOMER_ID, USER_ID: formData.USER_ID })
      .toArray();
    if (data) {
      if (data[0].EMAIL_SENT_AT == "" || data[0].EMAIL_SENT_AT == null) {
        sendMail(
          formData.USER_EMAIL,
          data[0].USER_FULLNAME,
          RESET_PASSWORD_TOKEN
        );
        let dateTime = new Date();
        db.collection("user_db").updateOne(
          {
            CUSTOMER_ID: formData.CUSTOMER_ID,
            USER_ID: formData.USER_ID,
          },
          { $set: { EMAIL_SENT_AT: dateTime } }
        );
        res.send("Mail sent");
      } else {
        let date = new Date();
        let interval = 360;
        let date_saved = new Date(data[0].EMAIL_SENT_AT);

        const diffTime = Math.abs(date - date_saved);
        var diffMinutes = Math.ceil(diffTime / (1000 * 60));
        if (diffMinutes >= interval) {
          sendMail(
            formData.USER_EMAIL,
            data[0].USER_FULLNAME,
            RESET_PASSWORD_TOKEN
          );
          db.collection("user_db").updateOne(
            {
              CUSTOMER_ID: formData.CUSTOMER_ID,
              USER_ID: formData.USER_ID,
            },
            { $set: { EMAIL_SENT_AT: dateTime } }
          );
          res.send("Mail sent");
        } else {
          res.send({
            Message: "Mail cannot be sent",
            time_difference_minutes: diffMinutes,
          });
        }
      }
    } else {
      res.send("Incorrect ID");
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
