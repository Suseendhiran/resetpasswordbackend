import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import cors from "cors";
import { usersRouter } from "./Routers/UsersRouter.js";

dotenv.config();

export const app = express();

app.listen(process.env.port || 3000);
app.use(express.json());
app.use(cors());

const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Connected");
  return client;
}
export const client = await createConnection();
app.get("/", (req, res) => {
  res.send("Express started");
});

app.use("/users", usersRouter);
