var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/notifications/seen_notification_by_user_id_get?CUSTOMER_ID=PWC0000001&USER_ID=PWS00001
*/

router.get("/", async function (req, res, next) {
  try {
    let formData = req.query;
    let db = await dbConnect();
    data = await db
      .collection("notifications")
      .aggregate([
        { $match: { CUSTOMER_ID: formData.CUSTOMER_ID, IS_ACTIVE: true } },
        { $unwind: "$RECEIVER_DATA" },
        {
          $match: {
            "RECEIVER_DATA.USER_ID": formData.USER_ID,
            // "RECEIVER_DATA.IS_SEEN": true,
          },
        },
      ])
      .project({ _id: 0 })
      .toArray();

    data.map((val) => {
      val.NOTIFICATION_TIME = val.NOTIFICATION_TIME.toLocaleString();
      val.USER_ID = val.RECEIVER_DATA.USER_ID;
      val.NOTIFICATION_SEEN_TIME =
        val.RECEIVER_DATA.NOTIFICATION_SEEN_TIME.toLocaleString();
      val.IS_SEEN = val.RECEIVER_DATA.IS_SEEN;
      delete val.RECEIVER_DATA;
    });

    res.send(data);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

// module.exports = router;
const GetNotificationData = async (customer_id, user_id) => {
  console.log("Get User data ", user_id);
  let db = await dbConnect();

  data = await db
    .collection("notifications")
    .aggregate([
      { $match: { CUSTOMER_ID: customer_id, IS_ACTIVE: true } },
      { $unwind: "$RECEIVER_DATA" },
      {
        $match: {
          "RECEIVER_DATA.USER_ID": user_id,
          // "RECEIVER_DATA.IS_SEEN": true,
        },
      },
    ])
    .project({ _id: 0 })
    .toArray();

  data.map((val) => {
    val.NOTIFICATION_TIME = val.NOTIFICATION_TIME.toLocaleString();
    val.USER_ID = val.RECEIVER_DATA.USER_ID;
    val.NOTIFICATION_SEEN_TIME =
      val.RECEIVER_DATA.NOTIFICATION_SEEN_TIME.toLocaleString();
    val.IS_SEEN = val.RECEIVER_DATA.IS_SEEN;
    delete val.RECEIVER_DATA;
  });

  return data;
};

module.exports = {
  router: router,

  start: function (io) {
    io.sockets.on("connection", (socket) => {
      console.log("Connection success", socket.id);
      // listen for message from user

      socket.on("NotificationJoin", async (notificationGet) => {
        console.log("notificationGet", notificationGet);

        // emit message from server to user
        socket.join(notificationGet.USER_ID);

        io.sockets.in(notificationGet.USER_ID).emit("notificationGet", {
          USER_DATA: await GetNotificationData(
            notificationGet.CUSTOMER_ID,
            notificationGet.USER_ID
          ),
        });
      });

      // socket.on("disconnect", () => {
      //   console.log("Connection disconnected", socket.id);
      // });
    });
  },
};
