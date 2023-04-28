//This API not required as image folders have been made public static
var express = require("express");
// var request = require("request")
var router = express.Router();
const dbConnect = require("../../db");
const path = require("path");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/student/student_ID_get
*/

router.get("/", function (req, res) {
  // var requestSettings = {
  //     url: '__dirname/student_ID_S0007.jfif',
  //     method: 'GET',
  //     encoding: null
  // };

  // request(requestSettings, function(error, response, body) {
  //     res.set('Content-Type', 'image/png');
  //     res.send(body);
  // });
  try {
    res.sendFile(
      path.join(__dirname, "../../student_id_uploads/student_ID_S0007.png")
    );
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.query);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
