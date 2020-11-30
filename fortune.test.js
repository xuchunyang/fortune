const Fortune = require("./fortune.js");
const fortune = new Fortune();

test("parse should throw errors", () => {
  expect(() => fortune.parseCommand("fortune -e 10% love art")).toThrow();
  expect(() => fortune.parseCommand("fortune -n 100 10% love art")).toThrow();
  expect(() => fortune.parseCommand("fortune 10.8% love art")).toThrow();
  expect(() => fortune.parseCommand("fortune 200% love art")).toThrow();
  expect(() => fortune.parseCommand("fortune 10% love 90%")).toThrow();
  expect(() => fortune.parseCommand("fortune 10% love 99% art")).toThrow();
  expect(() => fortune.parseCommand("fortune 10% love song")).toThrow();
});

test("-e 平均分布", () => {
  const { files } = fortune.parseCommand("fortune -e love art");
  expect(files[0].percentage).toBeCloseTo(0.5);

  const { files: files2 } = fortune.parseCommand("fortune -e love art chinese");
  expect(files2[0].percentage).toBeCloseTo(1 / 3);

  const {
    files: [{ percentage }],
  } = fortune.parseCommand("fortune -e");
  expect(percentage).toBeCloseTo(1 / fortune.files.length);
});

test("均匀分布", () => {
  for (const command of [
    "fortune",
    "fortune 10% love chinese",
    "fortune 50% love tang300 song100",
  ]) {
    expect(
      fortune
        .parseCommand(command)
        .files.reduce((acc, f) => (acc += f.percentage), 0)
    ).toBeCloseTo(1);
  }
});

test("-f", () => {
  console.log(fortune.filesMap);
  console.log(fortune.run("fortune -f"));
  console.log(fortune.run("fortune -f chinese tang300 song100"));
});

test("run", () => {
  console.log(fortune.run("fortune"));


  let love = 0;
  let song = 0;
  for (let i = 0; i < 10000; i++) {
    const result = fortune.run("fortune 50% love song100");
    if (result.file === "love") {
      love++;
    } else if (result.file === "song100") {
      song++;
    }
  }
  console.log(love, song);
});
