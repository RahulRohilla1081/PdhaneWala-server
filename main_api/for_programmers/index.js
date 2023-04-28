const express = require("express");
const port = 9001;

const app = express();
app.use(express.json());

apiFailMailToProgrammersRouter = require("./api_fail_mail_to_programmers");

app.use("/api_fail_mail_to_programmers", apiFailMailToProgrammersRouter);

app.listen(port, function (error) {
  if (error) {
    console.log("Something went wrong:", error);
  } else {
    console.log("Server is listening on port " + port);
  }
});
