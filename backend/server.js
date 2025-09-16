const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { connectDB, sequelize } = require("./config/db");
const router = require("./routes/index");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./routes/swagger");
const app = express();
const path = require("path");

app.use(cors());
app.use(express.json());

(async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  app.get("/", (req, res) => {
    res.json({ message: "Hello from MySQL + Sequelize" });
  });

  app.use("/api", router);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  const PORT = process.env.PORT || 1118;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})();
