import { client } from "./index.js";
import bcrypt from "bcrypt";

async function createUser(userDetails) {
  return await client.db("mailer").collection("users").insertOne(userDetails);
}
async function getUserByEmail(email) {
  return await client
    .db("mailer")
    .collection("users")
    .findOne({ email: email });
}
async function generateHashPassword(password) {
  let saltRounds = 10;
  const saltedPassword = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, saltedPassword);
  return hashedPassword;
}

export { createUser, getUserByEmail, generateHashPassword };
