var express = require("express");
const { reset } = require("nodemon");
var router = express.Router();
const dbConnect = require("../../db");

/*   
API url: - 
http://localhost:9000/main_api/login/student_teacher_login_validate_token?RESET_PASSWORD_TOKEN=6febe304cfefbe7edb4ed5bb881b2ba5
*/

router.get("/", async function (req, res, next) {
  try {
    let RESET_PASSWORD_TOKEN = req.query.RESET_PASSWORD_TOKEN;
    let db = await dbConnect();
    let data = await db
      .collection("user_login")
      .find({ RESET_PASSWORD_TOKEN: RESET_PASSWORD_TOKEN })
      .toArray();
    if (data.length > 0) {
      let data_user = await db
        .collection("user_db")
        .find({ USER_ID: data[0].USER_ID })
        .toArray();
      let user_data = {
        USER_ID: data_user[0].USER_ID,
        USER_FULLNAME: data_user[0].USER_FULLNAME,
        USER_EMAIL: data_user[0].USER_EMAIL,
        ROLE_ID: data_user[0].ROLE_ID,
        CUSTOMER_ID: data_user[0].CUSTOMER_ID,
      };
      res.send({ token_valid: true, DATA: user_data });
      // res.send(data)
    } else {
      res.send({ token_valid: false });
    }
  } catch (err) {
    console.log(err);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
