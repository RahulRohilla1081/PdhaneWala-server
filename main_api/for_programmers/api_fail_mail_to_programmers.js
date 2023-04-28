const express = require("express");
var nodemailer = require("nodemailer");
var router = express.Router();
const constants = require("../constants/constants");
const SUPPORT_EMAIL_ID = constants.SUPPORT_EMAIL_ID;
const SUPPORT_EMAIL_PASSWORD = constants.SUPPORT_EMAIL_PASSWORD;

/* 
API url: -     
http://localhost:9005/

payload:-
{
 "FILE_NAME":"abc", 
 "SERVER_STATUS ":"200",
 "DATA":{
  "abc":"abc"
 }
}

*/
router.post("/", async (req, res) => {
  console.log(req.body);

  let FILE_NAME = await req.body.FILE_NAME;
  let SERVER_STATUS = await req.body.SERVER_STATUS;
  let DATA = await req.body.DATA;
  let fromMail = SUPPORT_EMAIL_ID;
  let password = SUPPORT_EMAIL_PASSWORD;

  function sendMail(toMail, fullName, filename, server_status, req_data) {
    console.log("function called");
    var transporter = nodemailer.createTransport({
      service: "gmail", //comment this if using support portal

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

      subject: "BetaCode-Student Portal-API catch error",
      // attachments: [{ filename: file_name + ".csv", content: toCsv(content) }],

      html:
        "<h4>Hello " +
        fullName +
        "<br></h4><p>Greetings from Student_Portal! This is an auto-generated mail.<br></p><p>There has been an error in file " +
        filename +
        "<br>Following are the details:<br>" +
        "<ul><li>Server Status:" +
        server_status +
        "</li><li>Request Data: " +
        req_data +
        "</li></ul>",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log({
          msg: "fail",
          error: error,
        });

        if (error.responseCode == 432) {
          sendMail(toMail, fullName, filename, error, req_data);
        }
      } else {
        // console.log({
        //   msg: "success",
        //   RESET_PASSWORD_TOKEN: reset_pss_token,
        //   EMPLOYEE_ID: emp_id,
        // });
        console.log({
          MESSAGE: "Success! Mail sent",
        });
      }
    });
  }
  sendMail(
    "joyeeta41@gmail.com",
    "Joyeeta",
    FILE_NAME,
    SERVER_STATUS,
    JSON.stringify(DATA)
  );
  sendMail(
    "rahul.rohilla1081@gmail.com",
    "Rahul",
    FILE_NAME,
    SERVER_STATUS,
    JSON.stringify(DATA)
  );
  res.send("mail sent to timesheet team");
});

module.exports = router;
