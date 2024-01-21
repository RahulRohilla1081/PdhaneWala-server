var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/chat/chat_save
payload:-
{
        message: "Hello my friend",
        sentTime: new Date(),
        sender: "Name",
        sender_id:"",
        sender_customer_id:"",
        receiver_id:"",
        receiver_customer_id:"",
        direction: "incoming",
        position: "single",
      }
*/

router.post("/", async function (req, res, next) {
  try {
    res.send("chat saved");
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

// module.exports = router;
const saveChatData = async (chatPayload) => {
  console.log("Get User data ", chatPayload);
  chatPayload.isSeen = false;
  let db = await dbConnect();
  db.collection("chat").insertOne(chatPayload);

  return "chat saved in DB";
};

module.exports = {
  router: router,

  start: function (io) {
    io.sockets.on("connection", (socket) => {
      console.log("Connection success", socket.id);

      socket.on("joinUser", function (data) {
        console.log("jahsgjasgj", data);
        if(data.AUTH_ID!=undefined && data.CUSTOMER_ID!=undefined){
          socket.join(data.AUTH_ID + data.CUSTOMER_ID); // We are using room of socket io
        }
      });

      socket.on("ChatJoin", async (chatPayload) => {
        console.log("chatPayload", chatPayload);
        await saveChatData(chatPayload),
          io.sockets
            .in(chatPayload.receiver_id + chatPayload.receiver_customer_id)
            .emit("receiveChat", {
              CHAT_DATA: chatPayload,
            });
      });

      
    });
  },
};
