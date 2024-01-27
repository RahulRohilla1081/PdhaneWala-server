var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/chat/chat_typing
payload:-
{
       
        sender_id:"",
        sender_customer_id:"",
        receiver_id:"",
       receiver_customer_id,
       typing:true
      }
*/

// module.exports = router;

module.exports = {
  // router: router,

  start: function (io) {
    io.sockets.on("connection", (socket) => {
      console.log("Connection success", socket.id);
      // listen for message from user

      socket.on("ChatTyping", async (chatPayload) => {
        console.log("chatPayload", chatPayload);

        // emit message from server to user

        io.sockets
          .in(chatPayload.receiver_id + chatPayload.receiver_customer_id)
          .emit("typing", {
            ...chatPayload,
          });
      });

      // socket.on("disconnect", () => {
      //   console.log("Connection disconnected", socket.id);
      // });
    });
  },
};
