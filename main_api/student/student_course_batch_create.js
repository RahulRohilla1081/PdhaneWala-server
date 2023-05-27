var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const path = require("path");
const hat = require("hat");
var nodemailer = require("nodemailer");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");
const constants = require("../constants/constants");

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
http://localhost:9000/main_api/student/student_course_batch_create
payload:-
{  
    "CUSTOMER_ID":"PWC0000001",
    "USER_FULLNAME":"Rahul Rohilla",
    "GENDER":"MALE",
    "GUARDIAN_NAME":"Mr Rohilla",
    "USER_DOB":"2022-03-16",
    "USER_ADDRESS":"A-002, California-02009",
    "USER_CONTACT":"9234077889",
    "USER_EMAIL":"rahul.rohilla1081@gmail.com",
    "USER_ID_CARD_NUMBER":"125634",
    "USER_ID_CARD_TYPE":"Aadhar",
    "COURSE_ID":"C001",
    "ASSIGNED_FEE":"2300",
    "BATCH_NO":"B001",
    "START_DATE":"23-01-23",
    "RECEIVED_FEE":[{"DATE":"2023-03-20","AMOUNT":500}]
    "STUDENT_ID_CARD":"ID card pic from UI",
    "STUDENT_PROFILE_IMAGE":"Profile pic from UI",
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let RESET_PASSWORD_TOKEN = hat();
    let db = await dbConnect();

    //----------checking if batch limit crossed---------
    let batch_data = await db
      .collection("batch_master")
      .find({ CUSTOMER_ID: formData.CUSTOMER_ID, BATCH_NO: formData.BATCH_NO })
      .toArray();

    let batch_student = await db
      .collection("user_db")
      .aggregate([
        { $match: { CUSTOMER_ID: formData.CUSTOMER_ID } },
        { $unwind: "$STUDENT_COURSE" },
        { $match: { "STUDENT_COURSE.BATCH_NO": formData.BATCH_NO } },
      ])
      .project({ _id: 0 })
      .toArray();

    var FilteredStudent = batch_student.filter(
      (student) => student.BATCH_NO == formData.BATCH_NO
    );

    let BATCH_LIMIT = Number(batch_data[0].BATCH_LIMIT);
    let STUDENT_COUNT = FilteredStudent.length;

    if (BATCH_LIMIT > STUDENT_COUNT) {
      //-------------new STUDENT_ID creation---------------
      var USER_ID = "";
      let data = await db
        .collection("user_db")
        .aggregate([
          { $unwind: "$ROLE_ID" },
          { $match: { ROLE_ID: "STUDENT" } },
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
        ID = ID.toString().padStart(5, "0");
        USER_ID = "PWS" + ID;
      } else {
        USER_ID = "PWS00001";
      }

      let insertData_1 = [
        {
          COURSE_ID: formData.COURSE_ID,
          ASSIGNED_FEE: formData.ASSIGNED_FEE,
          BATCH_NO: formData.BATCH_NO,
          START_DATE: formData.START_DATE,
          END_DATE: "23-3-01",
          // RECEIVED_FEE: formData.RECEIVED_FEE,
          RECEIVED_FEE: JSON.parse(formData.RECEIVED_FEE),
          IS_COMPLETE: false,
          IS_CERTIFIED: false,
        },
      ];

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
        EMAIL_SENT_AT: "",
        USER_ID_CARD_NUMBER: formData.USER_ID_CARD_NUMBER,
        USER_ID_CARD_TYPE: formData.USER_ID_CARD_TYPE,
        ROLE_ID: ["STUDENT"],
        USER_ID_URL:
          SERVER_URL +
          "student_ID_" +
          formData.CUSTOMER_ID +
          "_" +
          USER_ID +
          ".png",
        USER_PROFILE_URL:
          SERVER_URL +
          "student_profile_" +
          formData.CUSTOMER_ID +
          "_" +
          USER_ID +
          ".png",
        IS_REMOVED: false,
        IS_ACTIVE: true,
        STUDENT_COURSE: insertData_1,
      };

      //---------------check if this student already exists--------------
      var is_student = await db
        .collection("user_db")
        .aggregate([
          {
            $match: {
              CUSTOMER_ID: formData.CUSTOMER_ID,
              USER_EMAIL: formData.USER_EMAIL,
            },
          },
        ])
        .toArray();

      if (is_student.length > 0) {
        if (
          is_student.some((val) =>
            val.STUDENT_COURSE.some(
              (innerval) => innerval.COURSE_ID == formData.COURSE_ID
            )
          )
        ) {
          res.send({
            Message: "Student already exists for this course",
            student_exists: true,
            batchLimitError: false,
          });
        } else {
          db.collection("user_db").updateOne(
            {
              CUSTOMER_ID: formData.CUSTOMER_ID,
              USER_EMAIL: formData.USER_EMAIL,
            },
            { $push: { STUDENT_COURSE: insertData_1[0] } }
          );
          res.send({
            Message: "Course added for existing student",
            student_exists: true,
            batchLimitError: false,
          });
        }
      } else {
        //---------------Check if this student is teacher also-----------------
        var is_teacher = await db
          .collection("user_db")
          .aggregate([
            { $match: { USER_EMAIL: formData.USER_EMAIL } },
            { $unwind: "$ROLE_ID" },
            { $match: { ROLE_ID: "TEACHER" } },
          ])
          .toArray();
        if (is_teacher.length > 0) {
          // var roles = ["CUSTOMER", "STUDENT"];
          db.collection("user_login").updateOne(
            { USER_ID: is_teacher[0].CUSTOMER_ID },
            { $push: { ROLE_ID: "STUDENT" } },
            { $set: { STUDENT_COURSE: insertData_1 } }
          );
        } else {
          let insertData_3 = {
            USER_ID: USER_ID,
            RESET_PASSWORD_TOKEN: RESET_PASSWORD_TOKEN,
            ROLE_ID: ["STUDENT"],
            IS_PASSWORD_RESET: false,
            CUSTOMER_ID: formData.CUSTOMER_ID,
          };
          db.collection("user_login").insertOne(insertData_3);
        }

        //----------------data save in DB---------------------

        db.collection("user_db").insertOne(insertData_2);

        // ---------Student profile and ID pic upload----------

        var noIdError = false;
        var noProfileError = false;
        const files = req.files;
        if (files) {
          const { STUDENT_ID_CARD, STUDENT_PROFILE_IMAGE } = req.files;
          if (!STUDENT_ID_CARD) {
            noIdError = true;
          } else if (!STUDENT_PROFILE_IMAGE) {
            noProfileError = true;
          }
        } else {
          noIdError = true;
          noProfileError = true;
        }
        // console.log("REQ.FILES", files);
        // console.log(Object.keys(files));

        if (files) {
          Object.keys(files).forEach(function (key, index) {
            if (key.includes("PROFILE")) {
              // var directory = "student_profile_uploads";
              var pathName =
                __dirname +
                "../../../assets/student_profile_uploads/student_profile_" +
                formData.CUSTOMER_ID +
                "_" +
                USER_ID +
                ".png";
            } else {
              // directory = "student_id_uploads";
              var pathName =
                __dirname +
                "../../../assets/student_id_uploads/student_ID_" +
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
                console.log("id uploaded");
                // res.send("File uploaded!");
              }
            );
          });
        }

        //----------Reset Password mail to student-----------
        let fromMail = SUPPORT_EMAIL_ID;
        let password = SUPPORT_EMAIL_PASSWORD;
        var customer_data = await db
          .collection("user_db")
          .find({ USER_ID: formData.CUSTOMER_ID })
          .toArray();

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
              " width='30'/> </div> <h4 style='text-align: left; align-items: center; margin-left: 15px;'>Hello " +
              user_name +
              "</h4> <p style='text-align: center;padding: 10px;'>This is an informational notice to ensure you're aware that your profile has been created at Pdhanewala.com by " +
              institute_name +
              ". To access your profile, kindly reset your password. Your Pdhanewala User ID will be your email ID.</p> <p style='text-align: center;'> Click on Reset Password below </p> <p class='data' style='text-align: justify-all; align-items: center; font-size: 15px; padding-bottom: 12px;'> </p> <img src=" +
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
                sendMail(
                  toMail,
                  user_name,
                  reset_pss_token,
                  customer_data[0].INSTITUTE_NAME
                );
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

        sendMail(
          formData.USER_EMAIL,
          formData.USER_FULLNAME,
          RESET_PASSWORD_TOKEN
        );

        res.send({
          Status: "Insert data success",
          student_exists: false,
          noIdError,
          noProfileError,
          batchLimitError: false,
        });
      }
    } else {
      res.send({
        Status: "Insert data fail",
        student_exists: true,
        noIdError: false,
        noProfileError: false,
        batchLimitError: true,
      });
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
