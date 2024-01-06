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

// ------------working example of socket----------
// const DataLaoBro = async () => {
//   let db = await dbConnect();

//   let data = await db.collection("user_login").find().toArray();

//   // console.log("DATA A RHA HAI", data);
//   return data;
// };

// module.exports = {
//   router: router,
//   start: function (io) {
//     io.on("connection", async (socket) => {
//       console.log("Connection success", socket.id);
//       // listen for message from user

//       socket.on("createMessage", (newMessage) => {
//         console.log("newMessage", newMessage);
//       });
//       // emit message from server to user

//       socket.emit("newMessage", {
//         // IS_VERIFIED: data[0].IS_VERIFIED,

//         IS_VERIFIED: await DataLaoBro(),
//       });
//       socket.on("disconnect", () => {
//         console.log("Connection disconnected", socket.id);
//       });
//     });
//   },
// };

const GetUserVerificationData = async (user_id) => {
  console.log("Get User data ", user_id);
  let db = await dbConnect();

  let data = await db
    .collection("user_login")
    .find({ USER_ID: user_id })
    .toArray();

  return data;
};

module.exports = {
  router: router,

  start: function (io) {
    io.sockets.on("connection", (socket) => {
      console.log("Connection success", socket.id);
      // listen for message from user

      socket.on("join", async (newMessage) => {
        console.log("newMessage", newMessage);

        // emit message from server to user
        socket.join(newMessage.USER_ID);

        io.sockets.in(newMessage.USER_ID).emit("newMessage", {
          USER_DATA: await GetUserVerificationData(newMessage.USER_ID),
        });
      });

      // socket.on("disconnect", () => {
      //   console.log("Connection disconnected", socket.id);
      // });
    });
  },
};
