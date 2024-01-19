var express = require("express");
var router = express.Router();
const axios = require("axios");
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/chatters/available_chatters_get?CUSTOMER_ID=PWC0000001&USER_ID=PWS00001
*/

router.get("/", async function (req, res, next) {
  try {
    let CUSTOMER_ID = req.query.CUSTOMER_ID;
    let USER_ID = req.query.USER_ID;
    let db = await dbConnect();

    axios
      .get(
        "http://localhost:9000/main_api/chatters/chatters_get?CUSTOMER_ID=" +
          CUSTOMER_ID +
          "&USER_ID=" +
          USER_ID
      )
      .then(async (response) => {
        let chatterData = { ...response.data };
        let chatData = await db
          .collection("chat")
          .find({
            $or: [
              { sender_customer_id: CUSTOMER_ID, sender_id: USER_ID },
              { receiver_customer_id: CUSTOMER_ID, receiver_id: USER_ID },
            ],
          })
          .toArray();
        console.log("chatterData", chatterData);
        console.log("chatData", chatData);

        let available_chatter = [];
        if (chatData.length > 0) {
          if (chatterData.student.length > 0) {
            chatterData.student.map((val) => {
              if (
                chatData.some(
                  (item) =>
                    (item.sender_customer_id == val.CUSTOMER_ID &&
                      item.sender_id == val.USER_ID) ||
                    (item.receiver_customer_id == val.CUSTOMER_ID &&
                      item.receiver_id == val.USER_ID)
                )
              ) {
                available_chatter.push(val);
              }
            });
          }
          if (chatterData.teachers.length > 0) {
            chatterData.teachers.map((val) => {
              if (
                chatData.some(
                  (item) =>
                    (item.sender_customer_id == val.CUSTOMER_ID &&
                      item.sender_id == val.USER_ID) ||
                    (item.receiver_customer_id == val.CUSTOMER_ID &&
                      item.receiver_id == val.USER_ID)
                )
              ) {
                available_chatter.push(val);
              }
            });
          }
          res.send({
            message: "chat history available",
            data: available_chatter,
          });
        } else {
          res.send({ message: "No chat history", data: [] });
        }
      });
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
