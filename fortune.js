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
    this.total = this.jsons.reduce((total, { count }) => (total += count), 0);
  }

  random() {
    let idx = getRandomInt(0, this.total);
    for (const json of this.jsons) {
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
