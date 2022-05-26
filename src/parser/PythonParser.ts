import Parser, { TestType } from "./Parser.js";

const test = new RegExp("^(.+)::(.+) ([^ ]+) +\\[(.+)\\%\\]");
const test2 = new RegExp("^([^ ]+) +(.*): ([0-9]+) tests \\((.*) secs\\)");
const test3 = new RegExp("^([^ ]+) ([\\.sF]+)( .*\\[.*)?$");
const test4 = new RegExp("1: \\{1\\} ([^ ]+) \\[(.*)s\\] ... (.*)$");
const test5 = new RegExp("^(PASS|FAIL): (.+)");
const testError1 = new RegExp("(ERROR|FAIL): (.+)( \\((.+)\\))?");
const testError2 = new RegExp("(.+):([0-9]+): error: (.+)");

const summaryPyTest = new RegExp(
  "==+ (([0-9]+) passed)(.+) in (.+) seconds ==+"
);
const summaryTest2 = new RegExp("Ran ([0-9]+) tests in (.+)s");
const summaryTest3 = new RegExp(
  "FAILED \\(SKIP=([0-9]+), errors=([0-9]+), failures=([0-9]+)\\)"
);
const summaryTest4 = new RegExp(
  "SUMMARY +([0-9]+)/([0-9]+) tasks and ([0-9]+)/([0-9]+) tests failed"
);
const summaryTest5 = new RegExp(
  "== ([0-9]+) failed, ([0-9]+) passed, ([0-9]+) skipped, ([0-9]+) pytest-warnings in ([0-9.]+) seconds ==="
);

const summaryTest6 = new RegExp(
  "(?<failed>[0-9]+) failed, (?<passed>[0-9]+) passed(, (?<skipped>[0-9]+) skipped)?(, (?<warning>[0-9]+) warnings) in (?<time>[0-9.]+)s"
);

const moduleNotFound = new RegExp(
  "ModuleNotFoundError: No module named '(?<library>[^']+)'"
);

const testStartWithBody = new RegExp("^(.+)::(test_.+)");

const startPyflakes = new RegExp("pyflakes verktyg");
const pyflakesStyleError = new RegExp("(.+):([0-9]+): (.+)");
const compilationError = new RegExp("SyntaxError: invalid syntax");

export default class PyParser extends Parser {
  currentTest: TestType | null = null;
  totalTime = 0;
  inPyflakes = false;

  constructor() {
    super("PyParser", ["python"]);
  }

  parse(line: string, lineNumber: number) {
    let result = test.exec(line);
    if (result) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[1] + "::" + result[2],
        body: "",
        nbTest: 1,
        nbFailure: result[3].indexOf("FAIL") != -1 ? 1 : 0,
        nbError: 0,
        nbSkipped: 0,
        time: 0,
      });
    } else if ((result = summaryPyTest.exec(line))) {
      this.tool = "pytest";
      this.totalTime = parseFloat(result[4]);
    } else if ((result = summaryTest3.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: 0,
        nbFailure: parseInt(result[3]),
        nbError: parseInt(result[2]),
        nbSkipped: parseInt(result[1]),
        time: 0,
      });
    } else if ((result = summaryTest4.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: parseInt(result[4]),
        nbFailure: parseInt(result[3]),
        nbError: 0,
        nbSkipped: 0,
        time: 0,
      });
    } else if ((result = summaryTest5.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: parseInt(result[2]) + parseInt(result[1]),
        nbError: 0,
        nbFailure: parseInt(result[1]),
        nbWarning: parseInt(result[4]),
        nbSkipped: parseInt(result[3]),
        time: parseInt(result[5]),
      });
    } else if ((result = summaryTest6.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest:
          parseInt(result.groups?.passed ?? "0") +
          parseInt(result.groups?.failed ?? "0"),
        nbFailure: parseInt(result.groups?.failed ?? "0"),
        nbError: 0,
        nbWarning: parseInt(result.groups?.warning ?? "0"),
        nbSkipped: parseInt(result.groups?.skipped ?? "0"),
        time: parseFloat(result.groups?.time ?? "0"),
      });
    } else if ((result = summaryTest2.exec(line))) {
      this.tool = "django";
      this.totalTime = parseFloat(result[2]);
    } else if ((result = startPyflakes.exec(line))) {
      this.inPyflakes = true;
    } else if (
      this.inPyflakes === true &&
      (result = pyflakesStyleError.exec(line))
    ) {
      this.inPyflakes = true;
      this.errors.push({
        failure_group: "Checkstyle",
        logLine: lineNumber,
        file: result[1],
        line: parseInt(result[2]),
        message: result[3],
        type: "Checkstyle",
      });
    } else if ((result = compilationError.exec(line))) {
      this.errors.push({
        failure_group: "Compilation",
        type: "Compilation error",
        logLine: lineNumber,
      });
    } else if ((result = moduleNotFound.exec(line))) {
      this.errors.push({
        logLine: lineNumber,
        category: "library",
        failure_group: "Installation",
        type: "Missing Library",
        library: result.groups?.library,
      });
    } else if ((result = test2.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[2],
        body: "",
        nbTest: parseInt(result[3]),
        nbFailure: 0,
        nbError: result[1] !== "SUCCESS" ? 1 : 0,
        nbSkipped: 0,
        time: parseFloat(result[4]),
      });
    } else if (line.indexOf("Download") == -1 && (result = test3.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[1],
        body: "",
        nbTest: result[2].length,
        nbFailure: (result[2].match(/F/g) || []).length,
        nbError: 0,
        nbSkipped: (result[2].match(/\\s/g) || []).length,
        time: 0,
      });
    } else if ((result = test4.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[1],
        body: "",
        nbTest: 1,
        nbFailure: 0,
        nbError: 0,
        nbSkipped: 0,
        time: parseFloat(result[2]),
      });
    } else if ((result = test5.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[2],
        body: "",
        nbTest: 1,
        nbFailure: result[1] == "FAIL" ? 1 : 0,
        nbError: 0,
        nbSkipped: 0,
        time: 0,
      });
    } else if ((result = testError1.exec(line))) {
      let name = result[2];
      if (result[4]) {
        name = result[4] + "::" + result[2];
      }
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: name,
        body: "",
        nbTest: 1,
        nbFailure: 1,
        nbError: 0,
        nbSkipped: 0,
        time: 0,
      });
    } else if ((result = testError2.exec(line))) {
      let name = result[1] + "::" + result[2];
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: name,
        body: result[3],
        nbTest: 1,
        nbFailure: 1,
        nbError: 0,
        nbSkipped: 0,
        time: 0,
      });
    } else if ((result = testStartWithBody.exec(line))) {
      this.currentTest = {
        failure_group: "Test",
        logLine: lineNumber,
        name: result[1] + "::" + result[2],
        body: "",
        nbTest: 1,
        nbFailure: 0,
        nbError: 0,
        nbSkipped: 0,
        time: 0,
      };
    } else {
      if (this.currentTest != null) {
        if (line == "PASSED" || line == "FAILED") {
          if (line == "FAILED") {
            this.currentTest.nbFailure = 1;
          }
          this.tests.push(this.currentTest);
          this.currentTest = null;
        } else {
          this.currentTest.body += line + "\n";
        }
      }
    }
  }
}