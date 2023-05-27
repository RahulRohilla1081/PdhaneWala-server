var express = require("express");
var router = express.Router();
// const dbConnect = require("../../db");
const Tesseract = require("node-tesseract-ocr");
var Jimp = require("jimp");
const path = require("path");

/*   
API url: - 
http://localhost:9000/main_api/testing/testing
payload:-
{
    "USER_ID":"PWS00001",
    "PASSWORD":"abcdefhashed",
    "CUSTOMER_ID": "PWC0000002",
     "IP_ADDRESS":"127.0.0.1",
   "USER_DEVICE" :"Iphone 14 Pro max",
   "LAST_ACTIVITY" : "160636232"
}
*/

// router.post("/", async function (req, res, next) {
//   try {
//     // Working Example
//     const image = "https://tesseract.projectnaptha.com/img/eng_bw.png";
//     // const image =
//     //   "../../../assets/certificate_template/certificate_template_PWC0000001_T01.png";

//     Tesseract.recognize(image, "eng", { logger: (e) => console.log(e) }).then((out) =>
//       {console.log(out)
//       res.send(out)
//       }

//     );

//     //------------------------------------

//     // const config = {
//     //   lang: "eng",
//     //   oem: 1,
//     //   psm: 3,
//     // };

//     // Tesseract.recognize(image, config)
//     //   .then((text) => {
//     //     console.log("Result:", text);
//     //     res.send(text);
//     //   })
//     //   .catch((error) => {
//     //     console.log(error.message);
//     //     res.send(error);
//     //   });
//   } catch (err) {
//     console.log(err);
//     res.send({ message: "Error in " + __filename });
//   }
// });

// module.exports = router;

// router.post("/", async function (req, res, next) {
//   try {
//     var fileName =
//       "./assets/certificate_template/certificate_template_PWC0000001_T01.png";
//     var imageCaption = "Image caption";
//     var loadedImage;

//     Jimp.read(fileName)
//       .then(function (image) {
//         loadedImage = image;
//         return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
//       })
//       .then(function (font) {
//         loadedImage.print(font, 50, 50, imageCaption).write(fileName);
//       })
//       .catch(function (err) {
//         console.error(err);
//       });
//     res.send("done");
//   } catch (err) {
//     console.log(err);
//     res.send({ message: "Error in " + __filename });
//   }
// });

// module.exports = router;

router.post("/", async function (req, res, next) {
  try {
    var fileName =
      "./assets/certificate_template/certificate_template_PWC0000001_T01.png";
    Jimp.read(fileName)
      .then(function (image) {
        image
          .color([{ apply: "brighten", params: [20] }])
          .contrast(1)
          .greyscale()
          .write(fileName);
      })
      .then(function () {
        Tesseract.recognize(fileName, {
          tessedit_char_whitelist: "AN%D%P",
        })
          .progress(function (message) {
            console.log(message);
          })
          .catch(function (err) {
            console.error(err);
          })
          .then(function (result) {
            console.log(result.text);
            res.send("Done");
          });
      })
      .catch(function (err) {
        console.error(err);
      });
  } catch (err) {
    console.log(err);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
