const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");


const url = "mongodb://localhost:27017";
const DatabaseName = "student_portal";
const client = new MongoClient(url);
async function DbConnect() {
  let result = await client.connect();
  db = result.db(DatabaseName);
  return db;
}
module.exports = DbConnect;


