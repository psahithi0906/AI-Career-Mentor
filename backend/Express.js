import cors from "cors";
import express from "express";

const app = express();

app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}));

app.use(express.json());