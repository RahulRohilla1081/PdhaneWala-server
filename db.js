const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");

// const url =
//   "mongodb+srv://RahulRohilla1081:Rahul1234@cluster0.xi8tcwh.mongodb.net/?retryWrites=true&w=majority";

const url = "mongodb://localhost:27017";
const DatabaseName = "student_portal";
const client = new MongoClient(url);
async function DbConnect() {
  let result = await client.connect();
  db = result.db(DatabaseName);
  return db;
}
mongoose.connect(
  "mongodb+srv://RahulRohilla1081:Rahul1234@cluster0.xi8tcwh.mongodb.net/student_portal?retryWrites=true&w=majority"
);
module.exports = DbConnect;

// const {MongoClient} =require("mongodb");
// const mongoose = require('mongoose')
// const url =
//   "mongodb+srv://RahulRohilla1081:Rahul1234@cluster0.xi8tcwh.mongodb.net/?retryWrites=true&w=majority";

// // const url = "mongodb://localhost:27017";
// const DatabaseName="student_portal"
// // const client =mongoose.connect(url);
// async function DbConnect(){
//   let db= await mongoose.connect(url);
//   // db=result.db(DatabaseName);
//   return db;
// }

// module.exports=DbConnect;
