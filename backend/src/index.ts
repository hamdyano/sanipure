import express from "express";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.get("/api/test", async (req, res) => {
  res.json({ message: "Test successful!" });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});