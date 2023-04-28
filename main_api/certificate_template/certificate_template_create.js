var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const path = require("path");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");
const constants = require("../constants/constants");
const SERVER_URL = constants.SERVER_URL;

/*   
API url: - 
http://localhost:9000/main_api/certificate_template/certificate_template_create
payload:-
{
    "CUSTOMER_ID":"PWC0000001",
    "TITLE":"CERTIFICATE 1"
    "STUDENT_NAME":[{"X_AXIS":123,"Y_AXIS":2.2}],
    "COURSE_NAME":[{"X_AXIS":123,"Y_AXIS":2.2}],
    "START_DATE":[{"X_AXIS":123,"Y_AXIS":2.2}],
    "END_DATE":[{"X_AXIS":123,"Y_AXIS":2.2}],
    "QR_CODE":[{"X_AXIS":123,"Y_AXIS":2.2}],
    "CUSTOMER_LOGO":[{"X_AXIS":123,"Y_AXIS":2.2}],
    "CUSTOMER_INSTITUTE_NAME":[{"X_AXIS":123,"Y_AXIS":2.2}],
    "CUSTOMER_SIGNATURE":[{"X_AXIS":123,"Y_AXIS":2.2}],
    "IS_DEFAULT":true,
    "TEMPLATE_IMAGE":image from UI  
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    let TEMPLATE_ID = "";
    //---------------------certificate template ID creation------------------------
    let data = await db
      .collection("certificate_template")
      .find({ CUSTOMER_ID: formData.CUSTOMER_ID })
      .toArray();

    if (data.length > 0) {
      var sorted = data.sort((a, b) =>
        b.TEMPLATE_ID.localeCompare(a.TEMPLATE_ID)
      );
      let DataID = [sorted[0]];
      // let DataID = await db
      //   .collection("user_db")
      //   .find({})
      //   .sort({ USER_ID: -1 })
      //   .limit(1)
      //   .toArray();
      ID = parseInt(DataID[0].TEMPLATE_ID.substring(1)) + 1;
      ID = ID.toString().padStart(2, "0");
      TEMPLATE_ID = "T" + ID;
    } else {
      TEMPLATE_ID = "T01";
    }

    //-----------------------Insert component position data of template in DB--------------------
    let insertData = {
      TEMPLATE_ID: TEMPLATE_ID,
      TITLE: formData.TITLE,
      CUSTOMER_ID: formData.CUSTOMER_ID,
      STUDENT_NAME: JSON.parse(formData.STUDENT_NAME),
      COURSE_NAME: JSON.parse(formData.COURSE_NAME),
      START_DATE: JSON.parse(formData.START_DATE),
      END_DATE: JSON.parse(formData.END_DATE),
      QR_CODE: JSON.parse(formData.QR_CODE),
      CUSTOMER_LOGO: JSON.parse(formData.CUSTOMER_LOGO),
      CUSTOMER_INSTITUTE_NAME: JSON.parse(formData.CUSTOMER_INSTITUTE_NAME),
      CUSTOMER_SIGNATURE: JSON.parse(formData.CUSTOMER_SIGNATURE),
      TEMPLATE_PATH:
        SERVER_URL +
        "certificate_template_" +
        formData.CUSTOMER_ID +
        "_" +
        TEMPLATE_ID +
        ".png",
    };

    db.collection("certificate_template").insertOne(insertData);

    //----------------------template image upload---------------------
    if (req.files) {
      const { TEMPLATE_IMAGE } = req.files;
      var no_image = false;
      if (!TEMPLATE_IMAGE) {
        console.log("No image recieved");
        no_image = true;
      }
      TEMPLATE_IMAGE.mv(
        path.join(
          __dirname +
            "../../../assets/certificate_template/certificate_template_" +
            formData.CUSTOMER_ID +
            "_" +
            TEMPLATE_ID +
            ".png"
        )
      );
    } else {
      console.log("No Image file");
      no_image = true;
    }
    res.send({ Status: "Insert data success", no_image: no_image });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
