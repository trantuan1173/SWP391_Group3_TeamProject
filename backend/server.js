const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { connectDB, sequelize } = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  app.get("/", (req, res) => {
    res.json({ message: "Hello from MySQL + Sequelize" });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})();