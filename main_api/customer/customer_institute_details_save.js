//This API will not be required as customer gets created in signupUser API
var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");
const constants = require("../constants/constants");
const path = require("path");
const SERVER_URL = constants.SERVER_URL;

/*   
API url: - 
http://localhost:9000/main_api/customer/customer_institute_details_save
payload:-
{
    "USER_ID":"PWC0000002",
    "INSTITUTE_NAME":"Zephyr Institute",
    "INSTITUTE_ADDRESS":"Bangalore Whitefield",
    INSTITUTE_LOGO:logo image from UI
}
*/

//This API will not be required as customer gets created in signupUser API

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    db.collection("user_db").updateOne(
      { USER_ID: formData.USER_ID },
      {
        $set: {
          INSTITUTE_NAME: formData.INSTITUTE_NAME,
          INSTITUTE_ADDRESS: formData.INSTITUTE_ADDRESS,
          INSTITUTE_LOGO_URL:
            SERVER_URL + "customer_logo_" + formData.CUSTOMER_ID + ".png",
        },
      }
    );
    //-------------save customer logo-------------
    if (req.files) {
      const { INSTITUTE_LOGO } = req.files;
      var no_image = false;
      if (!INSTITUTE_LOGO) {
        console.log("No image recieved");
        no_image = true;
      }
      INSTITUTE_LOGO.mv(
        path.join(
          __dirname +
            "../../../assets/customer_institute/customer_logo_" +
            formData.CUSTOMER_ID +
            ".png"
        )
      );
    } else {
      console.log("No Image file");
      no_image = true;
    }
    res.send({ Message: "Data updated", no_image });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
