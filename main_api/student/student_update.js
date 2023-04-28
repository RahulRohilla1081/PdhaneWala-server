var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const path = require("path");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/student/student_update
payload:-
{  
    "CUSTOMER_ID":"PWC0000001",
    "USER_ID":"PWS00002",
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
    "STUDENT_ID_CARD":"ID card pic from UI",
    "STUDENT_PROFILE_IMAGE":"Profile pic from UI",
    "RECEIVED_FEE":[{"DATE":"2023-03-20","AMOUNT":500}]
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();

    //-----------------Update data in DB------------------

    let updateData_1 = [
      {
        COURSE_ID: formData.COURSE_ID,
        ASSIGNED_FEE: formData.ASSIGNED_FEE,
        BATCH_NO: formData.BATCH_NO,
        START_DATE: formData.START_DATE,
        END_DATE: "23-3-01",
        RECEIVED_FEE: JSON.parse(formData.RECEIVED_FEE),
      },
    ];

    let updateData_2 = {
      USER_FULLNAME: formData.USER_FULLNAME,
      GENDER: formData.GENDER,
      GUARDIAN_NAME: formData.GUARDIAN_NAME,
      USER_DOB: formData.USER_DOB,
      USER_ADDRESS: formData.USER_ADDRESS,
      USER_CONTACT: formData.USER_CONTACT,
      USER_EMAIL: formData.USER_EMAIL,
      USER_ID_CARD_NUMBER: formData.USER_ID_CARD_NUMBER,
      USER_ID_CARD_TYPE: formData.USER_ID_CARD_TYPE,
      STUDENT_COURSE: updateData_1,
    };

    db.collection("user_db").updateOne(
      {
        CUSTOMER_ID: formData.CUSTOMER_ID,
        USER_ID: formData.USER_ID,
      },
      { $set: updateData_2 }
    );

    //--------------------Update image---------------------
    const files = req.files;
    const { STUDENT_ID_CARD, STUDENT_PROFILE_IMAGE } = req.files;

    var noProfileError = false;
    var noIdError = false;
    if (!STUDENT_ID_CARD) {
      noIdError = true;
    } else if (!STUDENT_PROFILE_IMAGE) {
      noProfileError = true;
    }
    if (files) {
      Object.keys(files).forEach(function (key, index) {
        if (key.includes("PROFILE")) {
          var pathName =
            __dirname +
            "../../../assets/student_profile_uploads/student_profile_" +
            formData.USER_ID +
            ".png";
        } else {
          var pathName =
            __dirname +
            "../../../assets/student_id_uploads/student_ID_" +
            formData.USER_ID +
            ".png";
        }

        files[key].mv(path.join(pathName), function (err) {
          if (err) return res.status(500).send(err);
          console.log("id uploaded");
          // res.send("File uploaded!");
        });
      });
    }

    res.send({ Status: "Update data success" });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
