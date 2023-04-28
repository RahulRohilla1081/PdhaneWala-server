const axios = require("axios");

const axios_function_all_APIs_catch = (file_name, server_status, data) => {
  axios
    .post("http://localhost:9001/api_fail_mail_to_programmers", {
      FILE_NAME: file_name,
      SERVER_STATUS: server_status,
      DATA: data,
    })
    .then((res) => {
      // loadData();
      console.log("DATA SENT TO PROGRAMMER");

      // cogoToast.success("New Customer Created");
    })
    .catch((err) => {
      console.log("DATA NOT SENT");
      console.log([
        {
          FILE_NAME: file_name,
          ERR: err,
          DATA: data,
        },
      ]);

      // cogoToast.error("Something went wrong");
    });
};

module.exports = axios_function_all_APIs_catch;
