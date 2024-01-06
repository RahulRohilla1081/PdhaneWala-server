var express = require("express");
var router = express.Router();
const dbConnect = require("../db");
const { get } = require("request");

/*   
API url: - 
http://localhost:9000/main_api/tambula_generator
*/

router.post("/", async function (req, res, next) {
  let db = await dbConnect();

  let ticket_quantity = 6;
  let q = ticket_quantity / 6;
  let r = ticket_quantity % 6;
  let tickets = [];

  function getRandomNumber(lowLimit, highLimit) {
    let random = Math.floor(Math.random() * highLimit);

    if (random < lowLimit) {
      random += lowLimit;
    }
    return random;
  }

  // let num = getRandomNumber(0, 9);
  function getArray(lo, hi, qty) {
    let data = [];
    function pushNumber() {
      let temp = getRandomNumber(lo, hi);

      if (data.length == 0) {
        data.push(temp);
      } else {
        if (data.some((val) => val == temp)) {
          pushNumber();
        } else {
          data.push(temp);
        }
      }
    }
    for (var i = 0; i < qty; i++) {
      pushNumber();
    }
    return data;
  }
  let ticket = [];
  var array = [];
  let array_1 = [];
  function addRow() {
    position = getArray(0, 9, 4);
    ticket[ticket.length - 1].map((val, i) => {
      let zeroCountY = 0;

      for (var j = 0; j < ticket.length; j++) {
        if (ticket[j][i] == 0) {
          zeroCountY++;
        }
      }

      let zeroCountX = 0;
      let NumberCountX = 0;

      array_1.map((val) => {
        if (val == 0) {
          zeroCountX++;
        } else {
          NumberCountX++;
        }
      });

      console.log("i:", i);
      console.log("COUNT: ", zeroCountY, " ", zeroCountX, " ", NumberCountX);
      let temp = 0;
      ticket.map((innerVal, j) => {
        if (innerVal[i] > temp) {
          temp = innerVal[i];
        }
      });

      if (
        zeroCountX < 4 &&
        ((i == 0 && temp == 9 && zeroCountY < 9) ||
          (i == 8 && temp == 90 && zeroCountY < 7) ||
          (i > 0 && i < 8 && temp == i * 10 + 9 && zeroCountY < 8))
      ) {
        array_1.push(0);
      } else if (
        ((i == 0 && zeroCountY == 9) ||
          (i == 8 && zeroCountY == 7) ||
          (i > 0 && i < 8 && zeroCountY == 8)) &&
        NumberCountX < 5
      ) {
        array_1.push(temp + 1);
      } else if (
        position.some((val) => val == i) &&
        zeroCountX < 4 &&
        ((i == 0 && zeroCountY < 9) ||
          (i == 8 && zeroCountY < 7) ||
          (i > 0 && i < 8 && zeroCountY < 8))
      ) {
        array_1.push(0);
      } else if (val > 0 && NumberCountX < 5) {
        array_1.push(val + 1);
      } else {
        if (NumberCountX < 5) {
          if (temp == 0) {
            array_1.push(i * 10);
          } else {
            array_1.push(temp + 1);
          }
        } else if (
          zeroCountX < 4 &&
          ((i == 0 && zeroCountY < 9) ||
            (i == 8 && zeroCountY < 7) ||
            (i > 0 && i < 8 && zeroCountY < 8))
        ) {
          array_1.push(0);
        } else {
          array_1.push(0);
        }
      }
    });
    ticket.push(array_1);
  }

  function createTicketArray(a) {
    let position = getArray(0, 9, 4);
    for (var i = 0; i < 9; i++) {
      if (position.some((val) => val == i)) {
        array.push(0);
      } else if (i == 0) {
        array.push(1);
      } else {
        array.push(i * 10);
      }
    }

    ticket.push(array);

    for (var i = 0; i < a; i++) {
      addRow();
    }

    ticket.map((val, i) => {
      let tempTicket = [];
      if (i % 3 == 2 && i > 0) {
        tempTicket.push(ticket[i - 2]);
        tempTicket.push(ticket[i - 1]);
        tempTicket.push(ticket[i]);
        tickets.push(tempTicket);
      }
    });
    array = [];
    array_1 = [];
    ticket = [];
  }
  if (q > 0) {
    for (var i = 0; i < q; i++) {
      createTicketArray(17);
    }
  }
  if (r > 0) {
    for (var i = 0; i < 1; i++) {
      createTicketArray(r);
    }
  }

  res.send({ ticket: ticket, tickets: tickets });
});

module.exports = router;
