var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/student/single_image_upload
payload:-
{
    
}
*/

// var storage = multer.diskStorage({
//   destination: (req, file, callBack) => {
//     callBack(null, path.join(__dirname + "../../../assets/student_id_uploads")); // './public/images/' directory name where save the file
//   },
//   filename: (req, file, callBack) => {
//     callBack(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// var upload = multer({
//   storage: storage,
// });

// router.post("/", upload.single("image"), async function (req, res, next) {
//   try {
//     if (!req.file) {
//       console.log("No file upload");
//       res.send("error");
//     } else {
//       res.send("uploaded");
//     }
//   } catch (err) {
//     console.log(err);
//        axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
//  res.send({ message: "Error in " + __filename });
//   }
// });

router.post("/", async (req, res) => {
  // console.log(req.body);
  const files = req.files;
  const { image_id, image_pro } = req.files;
  console.log("REQ.FILES", files);
  console.log(Object.keys(files));
  var profileError = false;
  var idError = false;
  if (!image_id) {
    idError = true;
  } else if (!image_pro) {
    profileError = true;
  }
  if (files) {
    Object.keys(files).forEach(function (key, index) {
      if (key.includes("pro")) {
        var directory = "student_profile_uploads";
      } else {
        directory = "student_id_uploads";
      }

      files[key].mv(
        path.join(
          __dirname + "../../../assets/" + directory + "/" + files[key].name
        ),
        function (err) {
          if (err) return res.status(500).send(err);
          console.log("id uploaded");
          // res.send("File uploaded!");
        }
      );
    });
  }

  res.send({ idError, profileError });

  // app.post('/upload', (req, res) => {
  //   // Get the file that was set to our field named "image"
  //   const { image } = req.files;
  //   // If no image submitted, exit
  //   if (!image) return res.sendStatus(400);
  //   // Move the uploaded image to our upload folder
  //   image.mv(__dirname + '/upload/' + image.name);
  //   res.sendStatus(200); });
});

module.exports = router;
