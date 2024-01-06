const axios = require("axios");
const port = "9001";

const reminder_mail_API_call = () => {
  function getCurrentTimeIST() {
    var currTimeArrHrMin = [];
    var currentTime = new Date();

    console.log("test", currentTime.getHours());

    var hoursIST = currentTime.getHours();
    var minutesIST = currentTime.getMinutes();

    currTimeArrHrMin.push(hoursIST, minutesIST);
    return currTimeArrHrMin;
  }
  const SendTimeIntervalReminderEmails = () => {
    let timeNow = getCurrentTimeIST();

    if (timeNow > 17 && timeNow < 18) {
      axios
        .post(
          "http://localhost:" +
            port +
            "/reminder_mail/fill_timesheet_reminder_mail_send"
        )
        .then((response) => {
          console.log("API called");
        })
        .catch((err) => {
          console.log("Something Went wrong while sending reminder mail", err);
        });

      setTimeout(SendTimeIntervalReminderEmails, 3600000);
    } else {
      setTimeout(SendTimeIntervalReminderEmails, 3600000);
      console.log("RF");

      // console.log("New date ", date);
    }
  };
  SendTimeIntervalReminderEmails();
};

module.exports = reminder_mail_API_call;
