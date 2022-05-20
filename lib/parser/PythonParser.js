"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Parser_1 = __importDefault(require("./Parser"));
var test = new RegExp("^(.+)::(.+) ([^ ]+) +\\[(.+)\\%\\]");
var test2 = new RegExp("^([^ ]+) +(.*): ([0-9]+) tests \\((.*) secs\\)");
var test3 = new RegExp("^([^ ]+) ([\\.sF]+)( .*\\[.*)?$");
var test4 = new RegExp("1: \\{1\\} ([^ ]+) \\[(.*)s\\] ... (.*)$");
var test5 = new RegExp("^(PASS|FAIL): (.+)");
var testError1 = new RegExp("(ERROR|FAIL): (.+)( \\((.+)\\))?");
var testError2 = new RegExp("(.+):([0-9]+): error: (.+)");
var summaryPyTest = new RegExp("==+ (([0-9]+) passed)(.+) in (.+) seconds ==+");
var summaryTest2 = new RegExp("Ran ([0-9]+) tests in (.+)s");
var summaryTest3 = new RegExp("FAILED \\(SKIP=([0-9]+), errors=([0-9]+), failures=([0-9]+)\\)");
var summaryTest4 = new RegExp("SUMMARY +([0-9]+)/([0-9]+) tasks and ([0-9]+)/([0-9]+) tests failed");
var summaryTest5 = new RegExp("== ([0-9]+) failed, ([0-9]+) passed, ([0-9]+) skipped, ([0-9]+) pytest-warnings in ([0-9.]+) seconds ===");
var summaryTest6 = new RegExp("(?<failed>[0-9]+) failed, (?<passed>[0-9]+) passed(, (?<skipped>[0-9]+) skipped)?(, (?<warning>[0-9]+) warnings) in (?<time>[0-9.]+)s");
var moduleNotFound = new RegExp("ModuleNotFoundError: No module named '(?<library>[^']+)'");
var testStartWithBody = new RegExp("^(.+)::(test_.+)");
var startPyflakes = new RegExp("pyflakes verktyg");
var pyflakesStyleError = new RegExp("(.+):([0-9]+): (.+)");
var compilationError = new RegExp("SyntaxError: invalid syntax");
var PyParser = /** @class */ (function (_super) {
    __extends(PyParser, _super);
    function PyParser() {
        var _this = _super.call(this, "PyParser", ["python"]) || this;
        _this.currentTest = null;
        _this.totalTime = 0;
        _this.inPyflakes = false;
        return _this;
    }
    PyParser.prototype.parse = function (line, lineNumber) {
        var result = test.exec(line);
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
        }
        else if ((result = summaryPyTest.exec(line))) {
            this.tool = "pytest";
            this.totalTime = parseFloat(result[4]);
        }
        else if ((result = summaryTest3.exec(line))) {
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
        }
        else if ((result = summaryTest4.exec(line))) {
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
        }
        else if ((result = summaryTest5.exec(line))) {
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
        }
        else if ((result = summaryTest6.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: parseInt(result.groups.passed) + parseInt(result.groups.failed),
                nbFailure: parseInt(result.groups.failed),
                nbError: 0,
                nbWarning: parseInt(result.groups.warning) || 0,
                nbSkipped: parseInt(result.groups.skipped) || 0,
                time: parseFloat(result.groups.time),
            });
        }
        else if ((result = summaryTest2.exec(line))) {
            this.tool = "django";
            this.totalTime = parseFloat(result[2]);
        }
        else if ((result = startPyflakes.exec(line))) {
            this.inPyflakes = true;
        }
        else if (this.inPyflakes === true &&
            (result = pyflakesStyleError.exec(line))) {
            this.inPyflakes = true;
            this.errors.push({
                failure_group: "Checkstyle",
                logLine: lineNumber,
                file: result[1],
                line: parseInt(result[2]),
                message: result[3],
                type: "Checkstyle",
            });
        }
        else if ((result = compilationError.exec(line))) {
            this.errors.push({
                failure_group: "Compilation",
                type: "Compilation error",
                logLine: lineNumber,
            });
        }
        else if ((result = moduleNotFound.exec(line))) {
            this.errors.push({
                logLine: lineNumber,
                category: "library",
                failure_group: "Installation",
                type: "Missing Library",
                library: result.groups.library,
            });
        }
        else if ((result = test2.exec(line))) {
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
        }
        else if (line.indexOf("Download") == -1 && (result = test3.exec(line))) {
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
        }
        else if ((result = test4.exec(line))) {
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
        }
        else if ((result = test5.exec(line))) {
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
        }
        else if ((result = testError1.exec(line))) {
            var name = result[2];
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
        }
        else if ((result = testError2.exec(line))) {
            var name = result[1] + "::" + result[2];
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
        }
        else if ((result = testStartWithBody.exec(line))) {
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
        }
        else {
            if (this.currentTest != null) {
                if (line == "PASSED" || line == "FAILED") {
                    if (line == "FAILED") {
                        this.currentTest.nbFailure = 1;
                    }
                    this.tests.push(this.currentTest);
                    this.currentTest = null;
                }
                else {
                    this.currentTest.body += line + "\n";
                }
            }
        }
    };
    return PyParser;
}(Parser_1.default));
exports.default = PyParser;
module.exports.Parser = PyParser;
