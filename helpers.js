import { client } from "./index.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

async function createUser(userDetails) {
  return await client.db("mailer").collection("users").insertOne(userDetails);
}
async function getUserByEmail(email) {
  return await client
    .db("mailer")
    .collection("users")
    .findOne({ email: email });
}

async function getUserById(id) {
  return await client
    .db("mailer")
    .collection("users")
    .findOne({ _id: ObjectId(id) });
}
async function generateHashPassword(password) {
  let saltRounds = 10;
  const saltedPassword = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, saltedPassword);
  return hashedPassword;
}

async function resetPassword(password, id) {
  return await client
    .db("mailer")
    .collection("users")
    .updateOne(
      { _id: ObjectId(id) },
      { $set: { password: password, resetToken: null } }
    );
}

async function updateResetToken(token, id) {
  return await client
    .db("mailer")
    .collection("users")
    .updateOne({ _id: ObjectId(id) }, { $set: { resetToken: token } });
}

export {
  createUser,
  getUserByEmail,
  generateHashPassword,
  getUserById,
  resetPassword,
  updateResetToken,
};
