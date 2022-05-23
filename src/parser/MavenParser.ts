import Parser, { ErrorType, TestType } from "./Parser";

const startTestRun = new RegExp("Running (.*Tests?.*)$");
const endTestRun = new RegExp(
  "Tests run: ([0-9]+), Failures: ([0-9]+), Errors: ([0-9]+), Skipped: ([0-9]+), Time elapsed: ([0-9.]+) s"
);
const gradleRegex = new RegExp("\\[([^\\]]+)\\]: ([A-Z]+) in (.*)");
const gradleRegex2 = new RegExp(" ([a-zA-Z0-9\\-_]+)\\(\\) (↷|■|✔)( .*)?");
const gradleRegex3 = new RegExp("Running test:( test)? (.+)\\((.+)\\)");
const gradleRegex4 = new RegExp("Failed test (.+) \\[(.+)\\] with exception: ");
const endGradle1 = new RegExp(
  "([0-9]+) tests completed, ([0-9]+) failed, (([0-9]+) skipped)?"
);

const javacErrorRegex = new RegExp("\\[javac\\] ([^:]+):([0-9]+): error: (.*)");

const startCompilationError = new RegExp("\\[ERROR\\] COMPILATION ERROR");
const endCompilationError = new RegExp("([0-9]+) errors");
const compilationErrorLine1 = new RegExp(
  "\\[ERROR\\] ([^:]+):\\[([0-9]+),([0-9]+)\\] (.+)"
);
const compilationError2Line1 = new RegExp(
  "([^:]+):\\[([0-9]+),([0-9]+)\\] error: (.+)"
);
const compilationError3Line1 = new RegExp("(.+):([0-9]+): error: (.+)");

const compilationErrorLine2 = new RegExp("symbol\\: +(.+)");
const compilationErrorLine3 = new RegExp("location\\: +(.+)");

const missingLib = new RegExp("Could not find ([^:]+):([^:]+):(.+).");
const missingLib2 = new RegExp(
  "Failed to collect dependencies at ([^:]+):([^:]+):(.+)"
);

const startCheckstyle = new RegExp(
  "\\[INFO\\] There (is|are) (.+) errors? reported by Checkstyle .+ with (.+) ruleset."
);
const endCheckstyle = new RegExp(
  "\\[INFO\\] ------------------------------------------------------------------------"
);
const checkstyleError = new RegExp(
  "\\[ERROR\\] ([^:]+):\\[([0-9]+)(,([0-9]+))?\\] (.+)."
);
const checkstyleError2 = new RegExp(
  "\\[ERROR\\] ([^:]+):\\[([0-9]+)(,([0-9]+))?\\] (\\((.+)\\) (.+))."
);
const checkstyleError3 = new RegExp(
  "\\[checkstyle\\] \\[ERROR\\] ([^:]+):([0-9]+):(([0-9]+):)? (.+)"
);

const startAudit = new RegExp("\\[INFO\\] Starting audit...");
const endAudit = new RegExp("Audit done..");
const auditError = new RegExp("([^:]+):([0-9]+):(([0-9]+):)? (.+)");

const licenseError = new RegExp("\\[WARNING\\] Missing header in: (.+)");

const startError = new RegExp("Error: Could not find or load main class (.+)");

export default class MavenParser extends Parser {
  inCheckstyleReport = false;
  inCompilationErrorReport = false;
  inCompilationError = false;
  startingMaven = false;
  isAudit = false;
  inGradleError = false;

  currentError: Partial<ErrorType> | null = null;
  currentTest: Partial<TestType> | null = null;

  constructor() {
    super("MavenParser", ["java"]);
  }

  parse(line: string, lineNumber: number) {
    if (
      this.tool == null &&
      line.toLowerCase().indexOf("mvn ") != -1 &&
      line != "mvn version"
    ) {
      this.tool = "maven";
      this.startingMaven = true;
    } else if (
      this.tool == null &&
      line.toLowerCase().indexOf("gradle ") != -1 &&
      line != "gradle "
    ) {
      this.tool = "gradle";
      this.startingMaven = true;
    } else if (
      this.tool == null &&
      line.toLowerCase().indexOf("ant ") != -1 &&
      line != "ant version"
    ) {
      this.tool = "ant";
      this.startingMaven = true;
    }
    let result = null;
    if ((result = startError.exec(line))) {
      this.errors.push({
        message: result[1],
        type: "Execution",
        logLine: lineNumber,
        failure_group: "Generic error",
      });
    } else if ((result = gradleRegex3.exec(line))) {
      this.currentError = null;
      this.inGradleError = false;
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[3] + ":" + result[2],
        body: "",
        nbTest: 1,
        nbFailure: 0,
        nbError: 0,
        nbSkipped: 0,
        time: 0,
      });
    } else if ((result = gradleRegex4.exec(line))) {
      this.inGradleError = true;
      this.currentTest = {
        failure_group: "Test",
        logLine: lineNumber,
        name: result[2] + ":" + result[1],
        body: "",
        nbTest: 1,
        nbFailure: 1,
        nbError: 0,
        nbSkipped: 0,
        time: 0,
      };
      this.tests.push(this.currentTest as TestType);
    } else if ((result = endGradle1.exec(line))) {
      this.inGradleError = false;
      this.currentError = null;
    } else if (this.currentError != null && this.inGradleError === true) {
      if (this.currentTest) this.currentTest.body += line + "\n";
    } else if ((result = startAudit.exec(line))) {
      this.isAudit = true;
      return;
    } else if (this.isAudit === true) {
      if ((result = endAudit.exec(line))) {
        this.isAudit = false;
        return;
      } else if ((result = auditError.exec(line))) {
        this.errors.push({
          file: result[1],
          line: parseInt(result[2]),
          column: parseInt(result[4]),
          message: result[5],
          type: "Checkstyle",
          failure_group: "Checkstyle",
          logLine: lineNumber,
        });
        return;
      }
    }
    const startCompilationErrorResult = startCompilationError.exec(line);
    if (startCompilationErrorResult) {
      this.inCompilationErrorReport = true;
      return;
    }
    let compilationErrorLine1Result = compilationError3Line1.exec(line);
    if (compilationErrorLine1Result) {
      this.inCompilationErrorReport = true;
      this.inCompilationError = true;
      if (this.currentError) this.errors.push(this.currentError as ErrorType);
      this.currentError = {
        file: compilationErrorLine1Result[1],
        line: parseInt(compilationErrorLine1Result[2]),
        column: parseInt(compilationErrorLine1Result[3]),
        message: compilationErrorLine1Result[4],
        type: "Compilation",
      };
      return;
    }
    if (this.inCompilationErrorReport) {
      compilationErrorLine1Result = compilationErrorLine1.exec(line);
      if (compilationErrorLine1Result) {
        this.inCompilationError = true;
        if (this.currentError !== null)
          this.errors.push(this.currentError as ErrorType);
        this.currentError = {
          file: compilationErrorLine1Result[1],
          line: parseInt(compilationErrorLine1Result[2]),
          column: parseInt(compilationErrorLine1Result[3]),
          message: compilationErrorLine1Result[4],
          type: "Compilation",
        };
        return;
      }
      compilationErrorLine1Result = compilationError2Line1.exec(line);
      if (compilationErrorLine1Result) {
        this.inCompilationError = true;
        if (this.currentError !== null)
          this.errors.push(this.currentError as ErrorType);
        this.currentError = {
          file: compilationErrorLine1Result[1],
          line: parseInt(compilationErrorLine1Result[2]),
          column: parseInt(compilationErrorLine1Result[3]),
          message: compilationErrorLine1Result[4],
          type: "Compilation",
        };
        return;
      }

      const compilationErrorLine2Result = compilationErrorLine2.exec(line);
      if (compilationErrorLine2Result) {
        if (this.currentError == null) {
          this.currentError = null;
          this.inCompilationError = false;
          console.log(line);
          return;
        }
        this.currentError.message = compilationErrorLine2Result[1];
        return;
      }
      const compilationErrorLine3Result = compilationErrorLine3.exec(line);
      if (compilationErrorLine3Result) {
        if (this.currentError == null) {
          this.currentError = null;
          this.inCompilationError = false;
          console.log(line);
          return;
        }
        this.currentError.message = compilationErrorLine3Result[1];
        this.currentError = null;
        this.inCompilationError = false;
        return;
      }
      const endCompilationErrorResult = endCompilationError.exec(line);
      if (endCompilationErrorResult) {
        this.inCompilationErrorReport = false;
      }
      return;
    }

    const startCheckstyleResult = startCheckstyle.exec(line);
    if (startCheckstyleResult) {
      this.inCheckstyleReport = true;
      return;
    }
    if (this.inCheckstyleReport) {
      const endCheckstyleResult = endCheckstyle.exec(line);
      if (endCheckstyleResult) {
        this.inCheckstyleReport = false;
        return;
      }
      const checkstyleErrorResult = checkstyleError.exec(line);
      if (checkstyleErrorResult) {
        this.errors.push({
          file: checkstyleErrorResult[1],
          line: parseInt(checkstyleErrorResult[2]),
          column: parseInt(checkstyleErrorResult[4]),
          message: checkstyleErrorResult[5],
          type: "Checkstyle",
          failure_group: "Checkstyle",
          logLine: lineNumber,
        });
      }
      return;
    }
    let checkstyleErrorResult2 = checkstyleError2.exec(line);
    if (checkstyleErrorResult2) {
      this.errors.push({
        failure_group: "Checkstyle",
        file: checkstyleErrorResult2[1],
        line: parseInt(checkstyleErrorResult2[2]),
        column: parseInt(checkstyleErrorResult2[4]),
        message: checkstyleErrorResult2[5],
        type: "Checkstyle",
        logLine: lineNumber,
      });
    }
    checkstyleErrorResult2 = checkstyleError3.exec(line);
    if (checkstyleErrorResult2) {
      this.errors.push({
        failure_group: "Checkstyle",
        file: checkstyleErrorResult2[1],
        line: parseInt(checkstyleErrorResult2[2]),
        column: parseInt(checkstyleErrorResult2[4]),
        message: checkstyleErrorResult2[5],
        type: "Checkstyle",
        logLine: lineNumber,
      });
    }

    result = licenseError.exec(line);
    if (result) {
      this.errors.push({
        type: "Missing license",
        failure_group: "License",
        file: result[1],
        logLine: lineNumber,
      });
    }

    let missingLibResult = missingLib.exec(line);
    if (!missingLibResult) {
      missingLibResult = missingLib2.exec(line);
    }
    if (missingLibResult) {
      this.errors.push({
        type: "Missing Maven Library",
        failure_group: "Installation",
        logLine: lineNumber,
        group_id: missingLibResult[1],
        artifact: missingLibResult[2],
        version: missingLibResult[3],
      });
    }

    const start = startTestRun.exec(line);
    if (start) {
      this.currentTest = {
        name: start[1],
        body: "",
        nbTest: 0,
        nbFailure: 0,
        nbError: 0,
        nbSkipped: 0,
        time: 0,
      };
    } else {
      const end = endTestRun.exec(line);
      if (end) {
        if (this.currentTest == null) {
          return;
        }
        this.currentTest.nbTest = parseInt(end[1]);
        this.currentTest.nbFailure = parseInt(end[2]);
        this.currentTest.nbError = parseInt(end[3]);
        this.currentTest.nbSkipped = parseInt(end[4]);
        this.currentTest.time = parseFloat(end[5]);

        this.tests.push(this.currentTest as TestType);

        this.currentTest = null;
      } else {
        if (this.currentTest != null) {
          // output test
          this.currentTest.body += line + "\n";
        } else {
          const javacError = javacErrorRegex.exec(line);
          if (javacError) {
            this.errors.push({
              type: "Compilation",
              failure_group: "Compilation",
              logLine: lineNumber,
              file: javacError[1],
              line: parseInt(javacError[2]),
              message: javacError[3],
            });
          } else {
            let gradle = gradleRegex.exec(line);
            if (gradle) {
              this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: gradle[1] + ":" + gradle[3],
                body: "",
                nbTest: 1,
                nbFailure: gradle[2] != "SUCCESS" ? 1 : 0,
                nbError: 0,
                nbSkipped: 0,
                time: 0,
              });
            } else {
              gradle = gradleRegex2.exec(line);
              if (gradle) {
                this.tests.push({
                  failure_group: "Test",
                  logLine: lineNumber,
                  name: gradle[1],
                  body: gradle[2] != "✔" ? gradle[3] : "",
                  nbTest: 1,
                  nbFailure: gradle[2] == "■" ? 1 : 0,
                  nbError: 0,
                  nbSkipped: gradle[2] == "↷" ? 1 : 0,
                  time: 0,
                });
              }
            }
          }
        }
      }
    }
  }
}
