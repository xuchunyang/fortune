const express = require("express");
const morgan = require("morgan");
const debug = require("debug")("fortune");
const Fortune = require("./fortune");

const fortune = new Fortune();
const app = express();

app.set("x-powered-by", false);
app.set("trust proxy", 1);

app.use(morgan("dev"));

app.use(express.static("public"));

app.get("/api/fortune", (req, res) => {
  const { args } = req.query;
  let result;
  try {
    result = fortune.random(args);
  } catch (error) {
    res.status(404).json({ error: error.message });
    return;
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
