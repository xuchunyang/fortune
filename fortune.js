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

  getBySha1(sha1) {
    if (!this.items) {
      this.items = {};
      this.jsons.forEach((json) => {
        json.data.forEach((item) => {
          this.items[item.sha1] = item;
        });
      });
    }
    return this.items[sha1];
  }

  // command 指 fortune(6) 的命令行参数，现在只支持
  // 1. fortune，即没有参数
  // 2. fortune love tang300 song100
  run(command) {
    command = command || "";
    let jsons = this.jsons;
    const files = command
      .trim()
      .split(/\s+/)
      .slice(1)                 // skip "fortune"
      .filter((arg) => /^[^-0-9]/.test(arg));
    const nonExistFiles = files.filter((file) => !this.files.includes(file));
    if (nonExistFiles.length > 0) {
      throw new Error(`No such files: ${nonExistFiles.join(", ")}`);
    }
    if (files.length > 0) {
      jsons = this.jsons.filter((json) => files.includes(json.file));
    }

    const total = jsons
      .map((json) => json.count)
      .reduce((total, count) => (total += count));

    let idx = getRandomInt(0, total);
    for (const json of jsons) {
      if (idx < json.count) {
        const file = json.file;
        const { content, sha1 } = json.data[idx];
        return {
          file,
          content,
          sha1,
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
