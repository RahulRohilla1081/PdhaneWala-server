var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const PW_CERTIFICATE_TEMPLATES =
  require("../constants/pw_certificate_templates").PW_CERTIFICATE_TEMPLATES;
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/certificate_template/certificate_template_by_customerID_get?CUSTOMER_ID=PWC0000001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let db = await dbConnect();
    let default_certificate_data = await db
      .collection("user_db")
      .find({ USER_ID: CUSTOMER_ID })
      .project({ _id: 0 })
      .toArray();
    let customer_certificate = await db
      .collection("certificate_template")
      .find({ CUSTOMER_ID: CUSTOMER_ID })
      .project({ _id: 0 })
      .toArray();
    let all_templates = [...customer_certificate, ...PW_CERTIFICATE_TEMPLATES];
    all_templates.map((temp) => {
      if (
        temp.TEMPLATE_ID ==
        default_certificate_data[0].DEFAULT_CERTIFICATE_TEMPLATE.TEMPLATE_ID
      ) {
        temp.IS_DEFAULT = true;
      } else {
        temp.IS_DEFAULT = false;
      }
    });
    res.send(all_templates);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
