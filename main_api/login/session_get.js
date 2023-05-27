var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/login/session_get?SESSION_ID=ctyYk3saRhdWpkaqzg0O2ik5Vek5k7KJ
*/

router.get("/", async function (req, res, next) {
  try {
    // res.send("abcd");
    console.log("QUERY", req.query);
    let SESSION_ID = req.query.SESSION_ID;
    let db = await dbConnect();
    let data = await db
      .collection("sessions")
      .find({ SESSION_ID: SESSION_ID })
      .project({ _id: 0 })
      .toArray();

    if (data.length > 0) {
      if (!data[0].IS_LOGOUT) {
        let data_user = await db
          .collection("user_db")
          .aggregate([{ $match: { USER_ID: data[0].USER_ID } }])
          .toArray();
        console.log("DATA_USER", data_user);
        if (data_user.length > 0) {
          data[0].USER_NAME = data_user[0].USER_FULLNAME;
          data[0].USER_EMAIL = data_user[0].USER_EMAIL;
          data[0].GENDER = data_user[0].GENDER;
          data[0].ROLE_ID = data_user[0].ROLE_ID;
          data[0].INSTITUTE_NAME = data_user[0].INSTITUTE_NAME;
          data[0].INSTITUTE_ADDRESS = data_user[0].INSTITUTE_ADDRESS;
          data[0].LOGO_URL = data_user[0].LOGO_URL;
          data[0].DEFAULT_CERTIFICATE_TEMPLATE =
            data_user[0].DEFAULT_CERTIFICATE_TEMPLATE;
          res.send({
            message: "Active session",
            session_error: 0,
            user_not_found: 0,
            session_data: data,
          });
        } else {
          res.send({
            message: "User Not found",
            session_error: 0,
            user_not_found: 1,
            session_data: data,
          });
        }
      } else {
        res.send({ message: "Expired session", session_error: 1 });
      }
    } else {
      res.send([{ message: "Incorrect session", session_error: 1 }]);
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
