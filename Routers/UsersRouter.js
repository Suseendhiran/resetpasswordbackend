import { client } from "../index.js";
import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import {
  createUser,
  generateHashPassword,
  getUserByEmail,
} from "../helpers.js";

const router = express.Router();

router.route("/signup").post(async (req, res) => {
  console.log("userdetails", req.body);

  const { email, password } = req.body;
  const checkUserAlreadyExist = await getUserByEmail(email);

  if (checkUserAlreadyExist) {
    res.status(401).send({ message: "Username already exists" });
    return;
  }
  const hashedPassword = await generateHashPassword(password);
  const mongoResponse = await createUser({
    ...req.body,
    password: hashedPassword,
  });
  if (mongoResponse.acknowledged) {
    const createdUser = await getUserByEmail(email);
    const token = jwt.sign(
      { id: createdUser._id, email: createdUser.email },
      process.env.JWT_KEY
    );
    res.send({ message: "SignUp successfull", token: token });
  }
});
router.route("/login").post(async (req, res) => {
  const { email, password } = req.body;

  const userDetails = await getUserByEmail(email);
  console.log("login", req.body, userDetails);
  if (!userDetails) {
    res.status(401).send({ message: "Account doesn't exist" });
    return;
  }
  const matchpassword = await bcrypt.compare(password, userDetails.password);
  console.log("matched", matchpassword, password);
  if (matchpassword) {
    const token = jwt.sign(
      { id: userDetails._id, email: userDetails.email },
      process.env.JWT_KEY
    );
    res.send({
      message: "Successfull login",
      token: token,
      id: userDetails._id,
    });
  } else {
    res.status(401).send({ message: "Invalid credentials" });
  }
});

router.route("/resetpassword").put(async (req, res) => {
  const { email } = req.body;
  console.log("user", email);
  const userDetails = await getUserByEmail(email);
  if (!userDetails) {
    res.status(401).send({ message: "Account doesn't exist" });
    return;
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetPasswordLink = `https://hungry-hawking-315550.netlify.app/passwordReset?token=${resetToken}&id=${userDetails._id}`;
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async function sendResetMail() {
    let sentResponse = await smtpTransport.sendMail({
      from: process.env.MAIL_USERNAME,
      to: userDetails.email,
      subject: "Reset Password Link",
      text: "Reset Password",
      html: `<div>
              <div>Click the below link to reset your password</div>
              <a href=${resetPasswordLink}>${resetPasswordLink}</a>
            </div>`,
    });
    console.log("Mail respo", sentResponse);
  }
  sendResetMail()
    .then((msg) => {
      res.send({
        message:
          "Email sent to your mail, if not found, please check your spam folder",
      });
    })
    .catch(() => {
      res.send({ message: "Error!" });
    });
});

export const usersRouter = router;
