const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const port = process.env.PORT || 3000;
var app = express();
let server = http.createServer(app);
var io = socketIO(server);
const dbConnect = require("./db");

// make connection with user from server side
io.on("connection", (socket) => {
  console.log("New user connected");
  //emit message from server to user
  socket.emit("newMessage", {
    message: "IS_VERIFIED set to false",
  });

  // listen for message from user
  socket.on("createMessage", async (newMessage) => {
    console.log("newMessage", newMessage);
    let db = await dbConnect();
    db.collection("user_login").updateOne(
      { USER_ID: newMessage.USER_ID },
      { $set: { IS_VERIFIED: false } }
    );
  });

  // when server disconnects from user
  socket.on("disconnect", () => {
    console.log("disconnected from user");
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client-side.html");
});

server.listen(port);
