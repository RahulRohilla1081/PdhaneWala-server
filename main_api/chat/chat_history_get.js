var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

const chatHistoryGet = async (data) => {
  let USER_ID = data.USER_ID;
  let CUSTOMER_ID = data.CUSTOMER_ID;
  let db = await dbConnect();
  let chatHistory = await db
    .collection("chat")
    .find({
      $or: [
        { sender_id: USER_ID, sender_customer_id: CUSTOMER_ID },
        { receiver_id: USER_ID, receiver_customer_id: CUSTOMER_ID },
      ],
    })
    .toArray();

  return chatHistory;
};

module.exports = {
  // router: router,

  start: function (io) {
    io.sockets.on("connection", (socket) => {
      console.log("Connection success", socket.id);

      socket.on("ChatHistory", async (data) => {
        io.sockets.in(data.USER_ID + data.CUSTOMER_ID).emit("chatHistoryData", {
          CHAT_HISTORY: await chatHistoryGet(data),
        });
      });
    });
  },
};
