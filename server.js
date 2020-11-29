const express = require("express");
const morgan = require("morgan");
const debug = require("debug")("fortune");
const path = require("path");
const Fortune = require("./fortune");

const fortune = new Fortune();
const app = express();

app.set("x-powered-by", false);
app.set("trust proxy", 1);
// XXX pug not used yet
app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "pug");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

app.get("/api/fortune", (req, res) => {
  const data = JSON.stringify(fortune.random(), null, 2) + "\n";
  res.set("Content-Type", "application/json; charset=utf-8");
  res.send(data);
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
