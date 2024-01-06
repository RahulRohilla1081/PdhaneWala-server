//This API will not be required as customer gets created in signupUser API
var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const path = require("path");

const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/user/user_profile_update
payload:-
{
    "USER_ID":"PWC0000001",
    "CUSTOMER_ID":"",
    "ROLE_ID":[CUSTOMER]
    "USER_FULLNAME":"Rahul",
    "USER_EMAIL":"abcd",
    "USER_CONTACT":"abcd",
    "USER_GENDER":"male",
    "STUDENT_PROFILE_IMAGE":profile pic from UI
}
*/

//This API will not be required as customer gets created in signupUser API

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let ROLE_ID = JSON.parse(formData.ROLE_ID);
    var user_data;
    var pathName;
    let db = await dbConnect();
    if (formData.CUSTOMER_ID == "") {
      user_data = { USER_ID: formData.USER_ID };
    } else {
      user_data = {
        USER_ID: formData.USER_ID,
        CUSTOMER: formData.CUSTOMER_ID,
      };
    }
    db.collection("user_db").updateOne(user_data, {
      $set: {
        USER_FULLNAME: formData.USER_FULLNAME,
        USER_EMAIL: formData.USER_EMAIL,
        USER_CONTACT: formData.USER_CONTACT,
      },
    });

    //----------------profile pic update-----------
    var noProfileError = false;
    const { STUDENT_PROFILE_IMAGE } = req.files;
    if (!STUDENT_PROFILE_IMAGE) {
      noProfileError = true;
    } else {
      if (ROLE_ID.some((val) => val == "CUSTOMER")) {
        pathName =
          __dirname +
          "../../../assets/customer_profile_uploads/customer_profile_" +
          formData.USER_ID +
          ".png";
      } else if (ROLE_ID.some((val) => val == "STUDENT")) {
        var pathName =
          __dirname +
          "../../../assets/student_profile_uploads/student_profile_" +
          formData.CUSTOMER_ID +
          "_" +
          formData.USER_ID +
          ".png";
      } else if (ROLE_ID.some((val) => val == "TEACHER")) {
        var pathName =
          __dirname +
          "../../../assets/teacher_profile_uploads/teacher_profile_" +
          formData.CUSTOMER_ID +
          "_" +
          formData.USER_ID +
          ".png";
      }
      STUDENT_PROFILE_IMAGE.mv(path.join(pathName), function (err) {
        if (err) return res.status(500).send(err);
        console.log("id uploaded");
      });
    }

    res.send({
      server_status: res.statusCode,
      Message: "Update data success",
      noProfileError,
    });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
