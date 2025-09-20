import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middlewares/error.middleware.js";
import { authRouter, uploadRouter, userRouter } from "./routes/index.js";
import connectDB from "./config/db.js";

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/upload", uploadRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorHandler);

export default app;
