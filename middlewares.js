const helmet = require("helmet");
const xss = require("xss-clean");
const { body, validationResult } = require("express-validator");
const express = require("express");
const winston = require("winston");

const app = express();

// Security middleware
app.use(helmet());
app.use(xss());
app.use(express.json());

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/requests.log" }),
    new winston.transports.Console(),
  ],
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${duration} ms`,
      requestBody: req.body,
      responseBody: res.locals.responseData || null,
    });
  });

  const originalSend = res.send;
  res.send = function (body) {
    res.locals.responseData = body;
    originalSend.call(this, body);
  };

  next();
});

const validateRequest = [
  body("inputField").trim().escape(), 
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateRequest, logger };
