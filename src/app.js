import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.send("Hello from Express!");
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
