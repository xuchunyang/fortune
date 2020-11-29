const fs = require("fs");
const path = require("path");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min;
}

class Fortune {
  constructor() {
    const dir = path.resolve("fortunes");
    const files = fs
      .readdirSync(dir)
      .filter((fn) => path.extname(fn) === ".json")
      .map((fn) => path.join(dir, fn));
    const jsons = files.map((fn) => JSON.parse(fs.readFileSync(fn, "utf8")));
    this.jsons = jsons;
    this.files = this.jsons.map(({ file }) => file);
    this.total = this.jsons.reduce((total, { count }) => (total += count), 0);
  }

  // args 指 fortune(6) 的命令行参数，现在只支持
  // 1. fortune，即没有参数
  // 2. fortune love tang300 song100
  random(args) {
    let jsons = this.jsons;
    if (args) {
      const files = args
        .trim()
        .split(/\s+/)
        .filter((arg) => !arg.startsWith("-"));
      const nonExistFiles = files.filter((file) => !this.files.includes(file));
      if (nonExistFiles.length > 0) {
        throw new Error(`No such files: ${nonExistFiles.join(", ")}`);
      }
      jsons = this.jsons.filter((json) => files.includes(json.file));
    }

    const total = jsons
      .map((json) => json.count)
      .reduce((total, count) => (total += count));

    let idx = getRandomInt(0, total);
    for (const json of jsons) {
      if (idx < json.count) {
        const file = json.file;
        const content = json.data[idx];
        return {
          file,
          content,
        };
      }
      idx -= json.count;
    }
  }
}

if (!module.parent) {
  console.log(new Fortune().random());
}

module.exports = Fortune;
