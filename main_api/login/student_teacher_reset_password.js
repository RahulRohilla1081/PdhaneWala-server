var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const bcrypt = require("bcrypt");

/*   
API url: - 
http://localhost:9000/main_api/login/student_teacher_reset_password
payload:-
{
    "USER_ID":"PWS00001",
    "PASSWORD":"abcdefhashed",
    "CUSTOMER_ID": "PWC0000002",
     "IP_ADDRESS":"127.0.0.1",
   "USER_DEVICE" :"Iphone 14 Pro max",
   "LAST_ACTIVITY" : "160636232"
}
*/

router.post("/", async function (req, res, next) {
  try {
    let formData = await req.body;
    let db = await dbConnect();
    let data = await db
      .collection("user_login")
      .find({ USER_ID: formData.USER_ID, CUSTOMER_ID: formData.CUSTOMER_ID })
      .toArray();

    if (data.length > 0) {
      let user_data = await db
        .collection("user_db")
        .find({ CUSTOMER_ID: formData.CUSTOMER_ID, USER_ID: formData.USER_ID })
        .toArray();
      delete user_data[0].STUDENT_COURSE;
      user_data[0].IP_ADDRESS = formData.IP_ADDRESS;
      user_data[0].USER_DEVICE = formData.USER_DEVICE;
      user_data[0].LAST_ACTIVITY = formData.LAST_ACTIVITY;
      db.collection("user_login").updateOne(
        { USER_ID: formData.USER_ID, CUSTOMER_ID: formData.CUSTOMER_ID },
        {
          $set: {
            PASSWORD: formData.PASSWORD,
            IS_PASSWORD_RESET: true,
            IS_VERIFIED: true,
          },
        }
      );
      let insertData = {
        USER_ID: formData.USER_ID,
        SESSION_ID: req.session.id,
        IP_ADDRESS: formData.IP_ADDRESS,
        USER_DEVICE: formData.USER_DEVICE,
        LAST_ACTIVITY: formData.LAST_ACTIVITY,
        CUSTOMER_ID: formData.CUSTOMER_ID,
        IS_LOGOUT: false,
      };
      db.collection("sessions").insertOne(insertData);
      res.send({
        Message: "User valid",
        isUser: true, 
        user_data: {
          ...user_data,
          SESSION_ID: req.session.id,
          IS_LOGOUT: false,
        },
      });
    } else {
      res.send({ Message: "User not registered", isUser: false });
    }
  } catch (err) {
    console.log(err);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
