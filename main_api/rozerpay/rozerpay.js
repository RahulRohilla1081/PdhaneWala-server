require("dotenv").config();
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

router.post("/", async (req, res) => {
  const RAZORPAY_KEY_ID = "rzp_test_tzU3ZibM3FnX2B";
  const RAZORPAY_SECRET = "3Jvplg5nT7IQ2C1zXbaRU4Hn";
  try {
    const instance = new Razorpay({
      key_id: "rzp_test_tzU3ZibM3FnX2B",
      key_secret: "3Jvplg5nT7IQ2C1zXbaRU4Hn",
    });

    const options = {
      amount: 50000, // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt_order_74394",
    };

    const order = await instance.orders.create(options);
    console.log(order);

    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (err) {
    console.log(err);
    axios_function_all_APIs_catch(__filename, res.statusCode, req.body);
    res.send({ message: "Error in " + __filename });
  }
});





module.exports = router;