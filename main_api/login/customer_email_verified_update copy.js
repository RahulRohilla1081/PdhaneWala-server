var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/login/customer_email_verified_update
payload:-
{
    "VERIFY_USER_TOKEN":"773abc8ff3b8b78e32e696f988e08737",
     "IP_ADDRESS":"127.0.0.1",
   "USER_DEVICE" :"Iphone 14 Pro max",
   "LAST_ACTIVITY" : "160636232"
}
*/

router.post("/", async function (req, res, next) {
  try {
    // let VERIFY_USER_TOKEN = req.body.VERIFY_USER_TOKEN;
    let formData = req.body;
    let db = await dbConnect();

    let data = await db
      .collection("user_login")
      .find({ VERIFY_USER_TOKEN: formData.VERIFY_USER_TOKEN })
      .toArray();

    if (data.length > 0) {
      let user_data = await db
        .collection("user_db")
        .find({ USER_ID: data[0].USER_ID })
        .toArray();
      user_data[0].IP_ADDRESS = formData.IP_ADDRESS;
      user_data[0].USER_DEVICE = formData.USER_DEVICE;
      user_data[0].LAST_ACTIVITY = formData.LAST_ACTIVITY;
      user_data[0].IS_LOGOUT = false;

      db.collection("user_login").updateOne(
        { VERIFY_USER_TOKEN: formData.VERIFY_USER_TOKEN },
        { $set: { IS_VERIFIED: true } }
      );

      // io.emit("user_verified", user_login_data);

      // io.on("connection", (socket) => {
      //   console.log("New user connected");
      //   // listen for message from user
      //   var data;
      //   socket.on("createMessage", async (newMessage) => {
      //     console.log("newMessage", newMessage);
      //     let user_login_data = await db
      //       .collection("user_login")
      //       .find({ USER_ID: data[0].USER_ID })
      //       .toArray();
      //     console.log(data);
      //     socket.emit("newMessage", {
      //       IS_VERIFIED: user_login_data,
      //       // IS_VERIFIED: true,
      //     });
      //   });

      //   // when server disconnects from user
      //   socket.on("disconnect", () => {
      //     console.log("disconnected from user");
      //   });
      // });

      socket.on("createMessage", async (newMessage) => {
        console.log("newMessage", newMessage);
        let user_login_data = await db
          .collection("user_login")
          .find({ USER_ID: data[0].USER_ID })
          .toArray();
        console.log(data);
        socket.emit("newMessage", {
          IS_VERIFIED: user_login_data,
          // IS_VERIFIED: true,
        });
      });

      var insertData = {
        USER_ID: data[0].USER_ID,
        SESSION_ID: req.session.id,
        IP_ADDRESS: formData.IP_ADDRESS,
        USER_DEVICE: formData.USER_DEVICE,
        LAST_ACTIVITY: formData.LAST_ACTIVITY,
        IS_LOGOUT: false,
      };

      db.collection("sessions").insertOne(insertData);
      res.send({ SESSION_ID: req.session.id, login_data: user_data });
    } else {
      res.send("Token incorrect");
    }
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
