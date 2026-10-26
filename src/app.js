import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import requestRoutes from "./routes/requests.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", requestRoutes);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Connected to the database");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
