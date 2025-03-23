require("dotenv").config();

const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const cors = require("cors");

const allRoutes = require("./routes/allRoutes");
const { validateRequest, logger } = require("./middlewares");

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const PROTOCAL = process.env.PROTOCAL;

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(validateRequest);

app.use("/api", allRoutes);
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Invalid API Endpoint" });
});

app.listen(PORT, () => {
  const serverMsg = `Server running on ${PROTOCAL}://${HOST}:${PORT}`;
  logger.info(serverMsg);
});
