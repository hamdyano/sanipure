import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";


dotenv.config();


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
      origin: "http://localhost:5173", // Frontend origin
      credentials: true, // Allow credentials (cookies) to be sent
    })
  );

  

app.use(express.static(path.join(__dirname, "../../frontend/dist")));


app.get("/api/test", async (req, res) => {
  res.json({ message: "Test successful!" });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});