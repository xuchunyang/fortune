const express = require("express");
const morgan = require("morgan");
const debug = require("debug")("fortune");
const path = require("path");
const Fortune = require("./fortune");
const rateLimit = require("express-rate-limit");

const fortune = new Fortune();
const app = express();

app.set("x-powered-by", false);
app.set("trust proxy", 1);

app.use(morgan("dev"));

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "pug");

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
});

app.use(limiter);

app.get("/", (req, res) => {
  let { command, sha1 } = req.query;
  let result;
  if (sha1) {
    result = fortune.getBySha1(sha1) || {
      error: `No such sha1 ID: ${sha1}`,
    };
  } else {
    try {
      result = fortune.random(command);
    } catch (error) {
      result = { error: error.message };
    }
  }
  res.render("index", { command, result });
});

app.get("/api", (req, res) => {
  res.render("api");
});

app.get("/api/fortune", (req, res) => {
  const { sha1, command } = req.query;
  let result;
  if (sha1) {
    result = fortune.getBySha1(sha1) || {
      error: `No such sha1 ID: ${sha1}`,
    };
  } else {
    try {
      result = fortune.random(command);
    } catch (error) {
      result = { error: error.message };
    }
  }
  const data = JSON.stringify(result, null, 2) + "\n";
  res.set("Content-Type", "application/json; charset=utf-8");
  res.send(data);
});

app.get("/api/fortune/:sha1", (req, res) => {
  const result = fortune.getBySha1(req.params.sha1);
  if (!result) {
    res.status(404).json({ error: `No such sha1 ID: ${req.params.sha1}` });
    return;
  }
  res.json(result);
});

const server = app.listen(
  process.env.PORT || 3000,
  process.env.HOST || "localhost",
  () => {
    const { address, port } = server.address();
    console.log(`Listening at http://${address}:${port}/`);
  }
);

process.on("SIGTERM", () => {
  debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    debug("HTTP server closed");
  });
});
