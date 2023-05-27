var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");
const constants = require("../constants/constants");
const SUPPORT_EMAIL_ID = constants.SUPPORT_EMAIL_ID;
const SUPPORT_EMAIL_PASSWORD = constants.SUPPORT_EMAIL_PASSWORD;

/*   
API url: - 
http://localhost:9000/main_api/notifications/notifications_create
payload:-
{
    "INSTITUTE_NAME":"ABC Institute",
    "CUSTOMER_ID":"PWC0000001",
    "NOTIFICATION_TITLE":"Title",
    "DESCRIPTION":"Notification",
    "NOTIFICATION_TIME":"Fri May 19 2023 01:00:00 GMT+0530",
    "RECEIVER_DATA":[{
        "USER_ID":"PWS00001",
        "IS_SEEN":true,
        "NOTIFICATION_SEEN_TIME":""
    },
    {
        "USER_ID":"PWT001",
        "IS_SEEN":true,
        "NOTIFICATION_SEEN_TIME":""
    }]   
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    let data = await db
      .collection("notifications")
      .find({ CUSTOMER_ID: formData.CUSTOMER_ID })
      .toArray();
    var NOTIFICATION_ID = "";
    if (data.length > 0) {
      var sorted = data.sort((a, b) =>
        b.NOTIFICATION_ID.localeCompare(a.NOTIFICATION_ID)
      );
      let DataID = [sorted[0]];
      ID = parseInt(DataID[0].NOTIFICATION_ID.substring(1)) + 1;
      ID = ID.toString().padStart(8, "0");
      NOTIFICATION_ID = "N" + ID;
    } else {
      NOTIFICATION_ID = "N00000001";
    }

    formData.NOTIFICATION_TIME = new Date(formData.NOTIFICATION_TIME);

    db.collection("notifications").insertOne({
      NOTIFICATION_ID: NOTIFICATION_ID,
      ...formData,
      IS_ACTIVE: true,
    });

    let users = [];
    formData.RECEIVER_DATA.map((val) => {
      users.push(val.USER_ID);
    });

    let recipient_data = await db
      .collection("user_db")
      .find({ CUSTOMER_ID: formData.CUSTOMER_ID, USER_ID: { $in: users } });

    //----------Send mail to notification recipient-----------
    let fromMail = SUPPORT_EMAIL_ID;
    let password = SUPPORT_EMAIL_PASSWORD;

    var customer_data = await db
      .collection("user_db")
      .find({ USER_ID: formData.CUSTOMER_ID })
      .toArray();
    console.log("customer_data", customer_data);

    function sendMail(toMail, user_name, institute_name) {
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

        subject: institute_name + "-Check Notification",

        html:
          "<body style='background-color: #f3f2f0;'> <table align='center' border='0' cellpadding='0' cellspacing='0' width='550' bgcolor='white' style='box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition: 0.3s; width: 550px;' > <td align='center'> <div style='align-items: flex-start; display: flex;'> <img src=" +
          PDHANE_WALA_IMG +
          " width='120'/> </div> <h4 style='text-align: left; align-items: center; margin-left: 15px;'>Hello " +
          user_name +
          "</h4> <p style='text-align: center;padding: 10px;'>This is an informational notice to ensure you're aware that you have received notification at your Pdhanewala.com account by " +
          institute_name +
          ". Kindly check the notifications so that you don't miss out on important information.</p> <p style='text-align: center;'> Click on Reset Password below </p> <p class='data' style='text-align: justify-all; align-items: center; font-size: 15px; padding-bottom: 12px;'> </p>  <img src=" +
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
            sendMail(toMail, user_name, institute_name);
          }
        } else {
          console.log({
            USER_ID: USER_ID,
            info: info,
            RESET_PASSWORD_TOKEN: reset_pss_token,
          });
        }
      });
    }

    // sendMail(
    //   formData.USER_EMAIL,
    //   formData.USER_FULLNAME,
    //   RESET_PASSWORD_TOKEN,
    //   customer_data[0].INSTITUTE_NAME
    // );

    recipient_data.map((val) => {
      sendMail(val.USER_EMAIL, val.USER_FULLNAME, formData.INSTITUTE_NAME);
    });

    res.send({
      server_status: res.statusCode,
      message: "Notification created",
    });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
