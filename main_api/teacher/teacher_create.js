var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const path = require("path");
const hat = require("hat");
var nodemailer = require("nodemailer");
const constants = require("../constants/constants");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");
const HOST_URL_RESET_PASSWORD = constants.HOST_URL_RESET_PASSWORD;
const COMPANY_NAME = constants.COMPANY_NAME;
const DOMAIN_URL = constants.DOMAIN_URL;
const SUPPORT_EMAIL_ID = constants.SUPPORT_EMAIL_ID;
const SUPPORT_EMAIL_PASSWORD = constants.SUPPORT_EMAIL_PASSWORD;
const SERVER_URL = constants.SERVER_URL;
const PDHANE_WALA_IMG = constants.PDHANE_WALA_IMG;
const RESET_PASSWORD_IMAGE = constants.RESET_PASSWORD_IMAGE;
const BETACODE_LOGO = constants.BETACODE_LOGO;

/*   
API url: - 
http://localhost:9000/main_api/teacher/teacher_create
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "USER_FULLNAME":"Anaika",
    "GENDER":"FEMALE",
    "GUARDIAN_NAME":"Mr Sohan",
    "USER_DOB":"2022-03-16",
    "USER_ADDRESS":"A-002, California-02009",
    "USER_CONTACT":"9234077889",
    "USER_EMAIL":"rahul.rohilla1081@gmail.com",
    "USER_ID_CARD_NUMBER":"125634",
    "USER_ID_CARD_TYPE":"Aadhar",
    "TEACHER_ID_CARD":"ID card pic from UI",
    "TEACHER_PROFILE_IMAGE":"Profile pic from UI",
    "MONTHLY_SALARY":20000,
    
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    console.log("FORMDATA", formData);
    let RESET_PASSWORD_TOKEN = hat();
    let db = await dbConnect();

    //-------------new STUDENT_ID creation---------------
    var USER_ID = "";
    let data = await db
      .collection("user_db")
      .aggregate([
        { $unwind: "$ROLE_ID" },
        { $match: { ROLE_ID: "TEACHER" } },
        { $match: { CUSTOMER_ID: formData.CUSTOMER_ID } },
      ])
      .toArray();
    if (data.length > 0) {
      var sorted = data.sort((a, b) => b.USER_ID.localeCompare(a.USER_ID));
      let DataID = [sorted[0]];
      // let DataID = await db
      //   .collection("user_db")
      //   .find({})
      //   .sort({ USER_ID: -1 })
      //   .limit(1)
      //   .toArray();
      ID = parseInt(DataID[0].USER_ID.substring(3)) + 1;
      ID = ID.toString().padStart(3, "0");
      USER_ID = "PWT" + ID;
    } else {
      USER_ID = "PWT001";
    }

    let insertData_2 = {
      CUSTOMER_ID: formData.CUSTOMER_ID,
      USER_ID: USER_ID,
      USER_FULLNAME: formData.USER_FULLNAME,
      GENDER: formData.GENDER,
      GUARDIAN_NAME: formData.GUARDIAN_NAME,
      USER_DOB: formData.USER_DOB,
      USER_ADDRESS: formData.USER_ADDRESS,
      USER_CONTACT: formData.USER_CONTACT,
      USER_EMAIL: formData.USER_EMAIL,
      USER_ID_CARD_NUMBER: formData.USER_ID_CARD_NUMBER,
      USER_ID_CARD_TYPE: formData.USER_ID_CARD_TYPE,
      MONTHLY_SALARY: formData.MONTHLY_SALARY,
      USER_ID_URL:
        SERVER_URL +
        "teacher_ID_" +
        formData.CUSTOMER_ID +
        "_" +
        USER_ID +
        ".png",
      USER_PROFILE_URL:
        SERVER_URL +
        "teacher_profile_" +
        formData.CUSTOMER_ID +
        "_" +
        USER_ID +
        ".png",
      ROLE_ID: ["TEACHER"],
      IS_REMOVED: false,
      IS_ACTIVE: true,
    };

    //---------------check if this teacher already exists--------------
    var is_teacher = await db
      .collection("user_db")
      .aggregate([
        {
          $match: {
            CUSTOMER_ID: formData.CUSTOMER_ID,
            USER_EMAIL: formData.USER_EMAIL,
          },
        },
        { $unwind: "$ROLE_ID" },
        { $match: { ROLE_ID: "TEACHER" } },
      ])
      .toArray();

    if (is_teacher.length > 0) {
      res.send({
        Message: "Teacher already exists",
        teacher_exists: true,
      });
    } else {
      //---------------Check if this teacher is customer also-----------------
      var is_customer = await db
        .collection("user_db")
        .aggregate([
          { $match: { USER_EMAIL: formData.USER_EMAIL } },
          { $unwind: "$ROLE_ID" },
          { $match: { ROLE_ID: "CUSTOMER" } },
        ])
        .toArray();
      if (is_customer.length > 0) {
        // var roles = ["CUSTOMER", "STUDENT"];
        db.collection("user_login").updateOne(
          { USER_ID: is_customer[0].CUSTOMER_ID },
          { $push: { ROLE_ID: "TEACHER" } }
        );
      } else {
        let insertData_3 = {
          USER_ID: USER_ID,
          RESET_PASSWORD_TOKEN: RESET_PASSWORD_TOKEN,
          ROLE_ID: ["TEACHER"],
          IS_PASSWORD_RESET: false,
          CUSTOMER_ID: formData.CUSTOMER_ID,
        };
        db.collection("user_login").insertOne(insertData_3);
      }

      //----------------data save in DB for new teacher---------------------

      db.collection("user_db").insertOne(insertData_2);

      // ---------Teacher profile and ID pic upload----------

      const files = req.files;
      const { TEACHER_ID_CARD, TEACHER_PROFILE_IMAGE } = req.files;
      // console.log("REQ.FILES", files);
      // console.log(Object.keys(files));
      var noProfileError = false;
      var noIdError = false;
      if (!TEACHER_ID_CARD) {
        noIdError = true;
      } else if (!TEACHER_PROFILE_IMAGE) {
        noProfileError = true;
      }
      if (files) {
        Object.keys(files).forEach(function (key, index) {
          if (key.includes("PROFILE")) {
            // var directory = "student_profile_uploads";
            var pathName =
              __dirname +
              "../../../assets/teacher_profile_uploads/teacher_profile_" +
              formData.CUSTOMER_ID +
              "_" +
              USER_ID +
              ".png";
          } else {
            // directory = "student_id_uploads";
            var pathName =
              __dirname +
              "../../../assets/teacher_id_uploads/teacher_ID_" +
              formData.CUSTOMER_ID +
              "_" +
              USER_ID +
              ".png";
          }

          files[key].mv(
            path.join(
              // __dirname + "../../../assets/" + directory + "/" + files[key].name
              pathName
            ),
            function (err) {
              if (err) return res.status(500).send(err);
              console.log("Image uploaded");
              // res.send("File uploaded!");
            }
          );
        });
      }

      //----------Reset Password mail to teacher-----------
      let fromMail = SUPPORT_EMAIL_ID;
      let password = SUPPORT_EMAIL_PASSWORD;

      var customer_data = await db
        .collection("user_db")
        .find({ USER_ID: formData.CUSTOMER_ID })
        .toArray();
      console.log("customer_data", customer_data);
      function sendMail(toMail, user_name, reset_pss_token, institute_name) {
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
            "</h4> <p style='text-align: center;padding: 10px;'>This is an informational notice to ensure you're aware that your profile has been created at Pdhanewala.com by " +
            institute_name +
            ". To access your profile, kindly reset your password. Your Pdhanewala User ID will be your email ID.</p> <p style='text-align: center;'> Click on Reset Password below </p> <p class='data' style='text-align: justify-all; align-items: center; font-size: 15px; padding-bottom: 12px;'> </p> <img src=" +
            RESET_PASSWORD_IMAGE +
            " width='550'/> <a href=" +
            HOST_URL_RESET_PASSWORD+
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

      sendMail(
        formData.USER_EMAIL,
        formData.USER_FULLNAME,
        RESET_PASSWORD_TOKEN,
        customer_data[0].INSTITUTE_NAME
      );

      res.send({
        Status: "Insert data success",
        student_exists: false,
        noIdError,
        noProfileError,
      });
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
