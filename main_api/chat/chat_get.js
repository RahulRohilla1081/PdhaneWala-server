var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/chat/chat_get
payload:-
{
       
        sender_id:"",
        sender_customer_id:"",
        receiver_id:"",
       receiver_customer_id
      }
*/

router.get("/", async function (req, res, next) {
  try {
    let db = await dbConnect();
    let formData = req.body;
    let data = await db
      .collection("chat")
      .find({
        sender_id: formData.sender_id,
        sender_customer_id: formData.sender_customer_id,
        receiver_id: formData.receiver_id,
        receiver_customer_id: formData.receiver_customer_id,
      })
      .toArray();
    res.send(data);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

// module.exports = router;
const saveChatData = async (formData) => {
  console.log("Get User data ", formData);
  let data = await db
    .collection("chat")
    .find({
      sender_id: formData.sender_id,
      sender_customer_id: formData.sender_customer_id,
      receiver_id: formData.receiver_id,
      receiver_customer_id: formData.receiver_customer_id,
    })
    .toArray();

  return data;
};

module.exports = {
  router: router,

  start: function (io) {
    io.sockets.on("connection", (socket) => {
      console.log("Connection success", socket.id);
      // listen for message from user

      socket.on("ChatJoin", async (chatPayload) => {
        console.log("chatPayload", chatPayload);

        // emit message from server to user
        socket.join(chatPayload.sender_id);

        io.sockets.in(chatPayload.sender_id).emit("saveChat", {
          USER_DATA: await saveChatData(chatPayload),
        });
      });

      // socket.on("disconnect", () => {
      //   console.log("Connection disconnected", socket.id);
      // });
    });
  },
};
