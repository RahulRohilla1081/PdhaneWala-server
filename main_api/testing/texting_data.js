var express = require("express");
var router = express.Router();
// const dbConnect = require("../../db");
const Tesseract = require("node-tesseract-ocr");
var Jimp = require("jimp");
const path = require("path");

/*   
API url: - 
http://localhost:9000/main_api/testing/testing_data
payload:-

*/

router.post("/", async function (req, res, next) {
  try {
    let myData = [
      {
        DATE: "11-02-2023",
        POData: [],
        Vendor_Code: "0002000651",
        Vendor_Name: "Yatayat Corporation Of India",
        allDay: true,
        end: "2023-11-02",
        isDraggable: true,
        isResizable: false,
        resourceId: 33,
        start: "2023-11-02",
        title: 980000,
      },
      {
        DATE: "11-04-2023",
        POData: [],
        Vendor_Code: "0002000651",
        Vendor_Name: "Yatayat Corporation Of India",
        allDay: true,
        end: "2023-11-02",
        isDraggable: true,
        isResizable: false,
        resourceId: 33,
        start: "2023-11-02",
        title: 2311328,
      },
    ];
    // let myData = [
    //   {
    //     DATE: "12-01-2023",
    //     TOTAL: "2000",
    //   },
    //   {
    //     DATE: "12-15-2023",
    //     TOTAL: "4000",
    //   },
    //   {
    //     DATE: "12-17-2023",
    //     TOTAL: "5000",
    //   },
    //   {
    //     DATE: "12-18-2023",
    //     TOTAL: "1000",
    //   },
    //   {
    //     DATE: "12-19-2023",
    //     TOTAL: "6000",
    //   },
    //   {
    //     DATE: "12-26-2023",
    //     TOTAL: "1000",
    //   },
    // ];

    function getSumData(data) {
      let date = new Date(data[0].DATE);
      let dataMonth = date.getMonth() + 1;
      let dataYear = date.getFullYear();

      function getDayName(dateStr, locale) {
        var date = new Date(dateStr);
        return date.toLocaleDateString(locale, { weekday: "long" });
      }

      //var dateStr = '05/23/2014';
      //var day = getDayName(dateStr, "en-US");
      // console.log(day);

      function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
      }

      function getNextDay(day) {
        let nextDay;
        let weekdays = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        let dayIndex = weekdays.findIndex((val) => val == day);
        if (dayIndex >= 0 && dayIndex < 6) {
          let nextIndex = dayIndex + 1;
          nextDay = weekdays[nextIndex];
        } else if (dayIndex == 6) {
          nextDay = weekdays[0];
        } else {
          nextDay = -1;
        }
        return nextDay;
      }

      function getMonth(monthNum, year) {
        let monthDays = daysInMonth(monthNum, year);
        let firstDayDate = monthNum.toString() + "/" + "01/" + year.toString();

        let firstDay = getDayName(firstDayDate, "en-US");
        let monthData = [];
        for (var i = 1; i <= monthDays; i++) {
          let dayObj = {};
          dayObj.DATE = i;
          dayObj.DAY = firstDay;
          firstDay = getNextDay(firstDay);
          monthData.push(dayObj);
        }
        return monthData;
      }
      let monthData = getMonth(dataMonth, dataYear);

      let segrMonthData = [];
      let temp = [];
      monthData.map((val) => {
        if (val.DAY != "Saturday") {
          temp.push(val);
        } else {
          temp.push(val);
          segrMonthData.push(temp);
          temp = [];
        }
      });
      let len = segrMonthData.length;
      let segrMonthLastData = segrMonthData[len - 1];
      let segrMonthLastDay =
        segrMonthLastData[segrMonthLastData.length - 1].DATE;
      if (segrMonthLastDay != monthData[monthData.length - 1].DATE) {
        let lastWeek = [];
        for (
          i = segrMonthLastDay + 1;
          i <= monthData[monthData.length - 1].DATE;
          i++
        ) {
          let day = monthData.find((val) => val.DATE == i);
          lastWeek.push(day);
        }
        segrMonthData.push(lastWeek);
      }

      console.log("abcd", segrMonthData);

      let finalData = [];
      for (let i = 0; i < segrMonthData.length; i++) {
        let finalObj = {};
        let weeKfirst = segrMonthData[i][0].DATE;
        let weeKLast = segrMonthData[i][segrMonthData[i].length - 1].DATE;
        //  console.log("abcd",weeKfirst, weeKLast)

        let sum = 0;
        data.map((innerval) => {
          let d = new Date(innerval.DATE);
          let dateNum = d.getDate();

          if (dateNum >= weeKfirst && dateNum <= weeKLast) {
            sum += Number(innerval.title);
          }
        });

        finalObj.WEEK = i + 1;
        finalObj.SUM = sum;
        finalData.push(finalObj);
      }
      return finalData;
    }

    console.log("weekly sum", getSumData(myData));

    res.send(getSumData(myData));
  } catch (err) {
    console.log(err);
    res.send({ message: "Error in " + __filename });
  }
});

module.exports = router;
