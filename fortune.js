const fs = require("fs");
const path = require("path");
const assert = require("assert");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min;
}

function arraySum(array) {
  return array.reduce((total, elt) => (total += elt), 0);
}

function arrayRandomItem(array) {
  return array[getRandomInt(0, array.length)];
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
    this.files = this.jsons.map(({ file, count }) => {
      return { file, count };
    });
    this.filesMap = {};
    this.files.forEach(({ file, count }) => {
      this.filesMap[file] = count;
    });
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

  parseCommand(command) {
    const args = command.trim().split(/\s+/).slice(1);
    let fFlag = false;
    let eFlag = false;
    let files = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith("-")) {
        if (/[^-ef]/.test(args[i])) {
          throw new Error(`Support only -e and -f, unknown args: ${args[i]}`);
        }
        if (args[i].includes("f")) {
          fFlag = true;
        } else if (args[i].includes("e")) {
          eFlag = true;
        }
      } else if (/^[0-9]/.test(args[i])) {
        const percentage = Number(args[i].match(/\d+\.?\d*/)[0]);
        if (!Number.isInteger(percentage)) {
          throw new Error("percentages must be integers");
        }
        if (percentage > 100) {
          throw new Error("percentages must be <= 100");
        }
        if (i + 1 === args.length) {
          throw new Error("percentages must precede files");
        }
        const file = args[i + 1];
        files.push({ file, percentage });
        i++;
      } else {
        const file = args[i];
        files.push({ file });
      }
    }
    const sum = files.reduce((acc, file) => (acc += file.percentage || 0), 0);
    if (sum > 100) {
      throw new Error(`probabilities sum to ${sum}!`);
    }

    if (sum > 0 && eFlag) {
      throw new Error("Can't use -e and percentage at the same time");
    }

    if (files.length === 0) {
      files = this.files.map(({ file }) => {
        return { file };
      });
    }

    if (eFlag) {
      const per = 1 / files.length;
      files.forEach((f) => (f.percentage = per));
    } else {
      const remaining = (100 - sum) / 100;
      const total = files.reduce((acc, f) => {
        if (f.percentage === undefined) {
          return (acc += this.filesMap[f.file]);
        } else {
          return acc;
        }
      }, 0);
      files.forEach((f) => {
        if (f.percentage === undefined) {
          const count = this.filesMap[f.file];
          f.percentage = (remaining * count) / total;
        } else {
          f.percentage /= 100;
        }
      });
    }

    let total = 0;
    files.forEach((f) => {
      f.count = this.filesMap[f.file];
      if (f.count === undefined) {
        throw new Error(`unknown file ${f.file}`);
      }
      total += f.count;
    });

    return { fFlag, files, total };
  }

  // command 指 fortune(6) 的命令行参数，现在只支持
  // 1. fortune，即没有参数
  // 2. fortune love tang300 song100
  run(command = "fortune", count = 1) {
    let { fFlag, files, total } = this.parseCommand(command);
    if (fFlag) {
      return files;
    }

    files.forEach((f) => {
      f.percentage = Math.ceil(f.percentage * 100);
    });
    const missing = 100 - files.reduce((sum, f) => (sum += f.percentage), 0);
    files[files.length - 1].percentage += missing;
    assert.strictEqual(
      arraySum(files.map(({ percentage }) => percentage)),
      100
    );

    const results = [];
    for (let i = 0; i < count; i++) {
      let idx = getRandomInt(0, 100);
      for (const f of files) {
        if (idx <= f.percentage) {
          const json = this.jsons.find(({ file }) => file === f.file);
          const file = f.file;
          const { content, sha1 } = arrayRandomItem(json.data);
          results.push({ file, content, sha1 });
          break;
        }
        idx -= f.percentage;
      }
    }
    return count === 1 ? results[0] : results;
  }
}

if (!module.parent) {
  console.log(new Fortune().random());
}

module.exports = Fortune;
