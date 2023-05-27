//This API will not be required as customer gets created in signupUser API
var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const PW_CERTIFICATE_TEMPLATES =
  require("../constants/pw_certificate_templates").PW_CERTIFICATE_TEMPLATES;
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/certificate_template/customer_default_certificate_update
payload:-
{
    "USER_ID":"PWC0000002",
    "TEMPLATE_ID":"PW_T02"
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    let customer_template = await db
      .collection("certificate_template")
      .find({ CUSTOMER_ID: formData.USER_ID })
      .toArray();
    if (customer_template.length > 0) {
      var all_templates = [...PW_CERTIFICATE_TEMPLATES, ...customer_template];
    } else {
      all_templates = PW_CERTIFICATE_TEMPLATES;
    }
    let default_template = {};
    all_templates.map((val) => {
      if (val.TEMPLATE_ID == formData.TEMPLATE_ID) {
        default_template = val;
      }
    });

    db.collection("user_db").updateOne(
      { USER_ID: formData.USER_ID },
      { $set: { DEFAULT_CERTIFICATE_TEMPLATE: default_template } }
    );
    res.send("default template updated");
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);

    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
