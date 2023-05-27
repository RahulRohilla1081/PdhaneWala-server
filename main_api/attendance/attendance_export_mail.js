var express = require("express");
var router = express.Router();
var nodemailer = require("nodemailer");
// const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");
var excel = require("node-excel-export");
const constants = require("../constants/constants");
const SUPPORT_EMAIL_ID = constants.SUPPORT_EMAIL_ID;
const SUPPORT_EMAIL_PASSWORD = constants.SUPPORT_EMAIL_PASSWORD;

/*   
API url: - 
http://localhost:9000/main_api/attendance/attendance_export_mail
payload:-
{
    "EMAIL_ID":"joyeeta41@gmail.com",
    "INSTITUTE_NAME":"Betacode Ltd.",
   "ATTENDANCE_DATA": [{
    "_id": "645de059d2396c6a58fafb72",
    "CUSTOMER_ID": "PWC0000001",
    "USER_ID": "PWS00001",
    "DATE": "2023-05-07T00:00:00.000Z",
    "COURSE_ID": "C001",
    "BATCH_NO": "B002",
    "ATTENDANCE": "Absent",
    "TEACHER_ID": "PWT001",
    "COURSE_NAME": "React JS",
    "BATCH_NAME": "BetaCode",
    "STUDENT_NAME": "Rahul Student",
    "TEACHER_NAME": "Joyeeta B"
  },
  {
    "_id": "645dea45d2396c6a58fafb73",
    "CUSTOMER_ID": "PWC0000001",
    "USER_ID": "PWS00001",
    "DATE": "2023-05-08T00:00:00.000Z",
    "COURSE_ID": "C001",
    "BATCH_NO": "B002",
    "ATTENDANCE": "Present",
    "TEACHER_ID": "PWT001",
    "COURSE_NAME": "React JS",
    "BATCH_NAME": "BetaCode",
    "STUDENT_NAME": "Rahul Student",
    "TEACHER_NAME": "Joyeeta B"
  }]
}
*/

router.post("/", async function (req, res, next) {
  try {
    let EMAIL_ID = await req.body.EMAIL_ID;
    let INSTITUTE_NAME = await req.body.INSTITUTE_NAME;
    let ATTENDANCE_DATA = await req.body.ATTENDANCE_DATA;
    let fromMail = SUPPORT_EMAIL_ID;
    let password = SUPPORT_EMAIL_PASSWORD;

    function sendMail(toMail, content, institute_name) {
      var styles = {
        headerDark: {
          fill: {
            fgColor: {
              rgb: "FFFFFFFF",
            },
          },
          font: {
            color: {
              rgb: "FF000000",
            },
            sz: 14,
            bold: true,
            // underline: true,
          },
        },
        cellPink: {
          fill: {
            fgColor: {
              rgb: "FFFFCCFF",
            },
          },
        },
        cellGreen: {
          fill: {
            fgColor: {
              rgb: "FF00FF00",
            },
          },
        },
      };
      var specification = {
        // STUDENT_ID: {
        //   displayName: "Student ID",
        //   key: "USER_ID",
        //   headerStyle: styles.headerDark,
        //   width: 70,
        // },
        STUDENT_NAME: {
          displayName: "Student Name",
          key: "STUDENT_NAME",
          headerStyle: styles.headerDark,
          width: 215,
        },
        // COURSE_ID: {
        //   displayName: "Course ID",
        //   key: "COURSE_ID",
        //   headerStyle: styles.headerDark,
        //   width: 150,
        // },
        COURSE_NAME: {
          displayName: "Course Name",
          key: "COURSE_NAME",
          headerStyle: styles.headerDark,
          width: 250,
        },
        // BATCH_NO: {
        //   displayName: "Batch No",
        //   key: "BATCH_NO",
        //   headerStyle: styles.headerDark,
        //   width: 170,
        // },
        BATCH_NAME: {
          displayName: "Batch Name",
          key: "BATCH_NAME",
          headerStyle: styles.headerDark,
          width: 170,
        },
        // TEACHER_ID: {
        //   displayName: "Teacher ID",
        //   key: "TEACHER_ID",
        //   headerStyle: styles.headerDark,
        //   width: 170,
        // },
        TEACHER_NAME: {
          displayName: "Teacher Name",
          key: "TEACHER_NAME",
          headerStyle: styles.headerDark,
          width: 170,
        },
        DATE: {
          displayName: "Date",
          key: "DATE",
          headerStyle: styles.headerDark,
          width: 170,
        },
        ATTENDANCE: {
          displayName: "Attendance",
          key: "ATTENDANCE",
          headerStyle: styles.headerDark,
          width: 170,
        },
      };

      var report = excel.buildExport([
        {
          name: "Attendance_Report.xlsx",
          specification: specification,
          data: content,
        },
      ]);

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
        from: "Pdhanewala" + fromMail,
        to: toMail,

        subject: "Attendance Report",
        // attachments: [{ filename: file_name + ".csv", content: toCsv(content) }],
        attachments: [
          {
            filename: "Report.xlsx",
            content: new Buffer(report, "base64"),
          },
        ],

        html:
          "<h5>Hello User" +
          "</h5><p>Greetings from " +
          institute_name +
          "!<br>Please find enclosed the attendance report.<br>Regards<br>Dean",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log({
            msg: "fail",
            error: error,
          });

          if (error.responseCode == 432) {
            sendMail(toMail, content, institute_name);
          }
          res.send({ Message: "Error", Error: error, mailError: true });
        } else {
          // console.log({
          //   msg: "success",
          //   RESET_PASSWORD_TOKEN: reset_pss_token,
          //   EMPLOYEE_ID: emp_id,
          // });
          console.log({
            msg: "success! Mail sent",
          });
          res.send({ Message: "Mail sent", Error: "Nil", mailError: false });
        }
      });
    }
    sendMail(EMAIL_ID, ATTENDANCE_DATA, INSTITUTE_NAME);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
