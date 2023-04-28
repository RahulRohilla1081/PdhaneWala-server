var express = require("express");
var router = express.Router();
const dbConnect = require("../../db");
const axios_function_all_APIs_catch = require("../for_programmers/axios_function_all_APIs_catch");

/*   
API url: - 
http://localhost:9000/main_api/customer/login_customer_id_get?CUSTOMER_EMAIL="abc@email.com"
*/

router.get("/", async function (req, res, next) {
    try{
        let CUSTOMER_EMAIL = req.query.CUSTOMER_EMAIL;
        let db = await dbConnect();
        data = await db.collection("customer_db").find({CUSTOMER_EMAIL:CUSTOMER_EMAIL}).project({_id:0}).toArray();
        // console.log(data);
        res.send(data);
    }catch(err){
        console.log(err)
            axios_function_all_APIs_catch(
              __filename,
              res.statusCode,
              req.query
            );

        res.send({"message": "Error in "+__filename})    
 }
});

module.exports = router;
