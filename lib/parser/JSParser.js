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
var testNoAssert = new RegExp("✖ (.*) Test finished without running any assertions");
var testPassed = new RegExp("(✔|✓) ([^\\(]+)( \\(([0-9\\.]+)(.+)\\))?$");
var test2 = new RegExp("(ok|ko) ([0-9]+) (.*)$");
var test3 = new RegExp("Executed ([0-9]+) of ([0-9]+) (.*) \\(([0-9\\.]*) secs / ([0-9\\.]*) secs\\)");
var test4 = new RegExp("    ✗ (?<test>.*)");
var test5 = new RegExp("^FAIL (?<test>.*)");
// Spec Files:	 5 passed, 2 failed, 7 total (1 completed) in
var testSummary1 = /Spec Files:\W*(?<passed>[0-9]+) passed, (?<failed>[0-9]+) failed, (?<total>[0-9]+) total/;
var error = new RegExp("(.+):([0-9]+):([0-9]+) - error ([A-Z1-9]+): (.+)");
var endMocha = new RegExp("([1-9]+) passing (.*)\\(([1-9]+)(.*)s\\)$");
var unavailableVersion = new RegExp("No matching version found for (?<library>[^@]+)@(?<version>.+)");
var unavailablePackage = new RegExp('error Couldn\'t find package "(?<library>[^"]+)" required by "(?<required>[^"]+)"');
var JsParser = /** @class */ (function (_super) {
    __extends(JsParser, _super);
    function JsParser() {
        var _this = _super.call(this, "JSParser", ["js", "node"]) || this;
        _this.startingMocha = false;
        _this.totalTime = 0;
        return _this;
    }
    JsParser.prototype.parse = function (line, lineNumber) {
        if (this.tool == null && line.indexOf("mocha ") != -1) {
            this.tool = "mocha";
            this.startingMocha = true;
            this.totalTime = 0;
        }
        var result;
        if ((result = testNoAssert.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result[1],
                body: "",
                nbTest: 1,
                nbFailure: 0,
                nbError: 1,
                nbSkipped: 0,
                time: 0,
            });
        }
        else if (this.startingMocha && (result = testPassed.exec(line))) {
            var time = 0;
            if (result[4] != null) {
                time = parseFloat(result[4]);
                if (result[5] == "ms") {
                    time *= 0.001;
                }
                else if (result[5] == "m") {
                    time *= 60;
                }
            }
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result[2],
                body: "",
                nbTest: 1,
                nbFailure: 0,
                nbError: 0,
                nbSkipped: 0,
                time: time,
            });
        }
        else if ((result = test2.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result[3],
                body: "",
                nbTest: 1,
                nbFailure: result[1] != "ok" ? 1 : 0,
                nbError: 0,
                nbSkipped: 0,
                time: 0,
            });
        }
        else if ((result = test3.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: 1,
                nbFailure: result[3] != "SUCCESS" ? 1 : 0,
                nbError: 0,
                nbSkipped: 0,
                time: parseFloat(result[5]),
            });
        }
        else if ((result = test4.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result.groups.test,
                body: "",
                nbTest: 1,
                nbFailure: 1,
                nbError: 0,
                nbSkipped: 0,
            });
        }
        else if ((result = test5.exec(line))) {
            this.tool = "jasmine2";
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result.groups.test,
                body: "",
                nbTest: 1,
                nbFailure: 1,
                nbError: 0,
                nbSkipped: 0,
            });
        }
        else if ((result = testSummary1.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: parseInt(result.groups.total),
                nbFailure: parseInt(result.groups.failed),
                nbError: 0,
                nbSkipped: parseInt(result.groups.total) -
                    parseInt(result.groups.passed) -
                    parseInt(result.groups.failed),
            });
        }
        else if ((result = error.exec(line))) {
            this.errors.push({
                failure_group: "Execution",
                logLine: lineNumber,
                file: result[1],
                line: parseInt(result[2]),
                message: result[5],
            });
        }
        else if ((result = endMocha.exec(line))) {
            this.startingMocha = false;
            this.totalTime = parseFloat(result[3]);
        }
        else if ((result = unavailablePackage.exec(line))) {
            this.errors.push({
                category: "library",
                logLine: lineNumber,
                failure_group: "Installation",
                type: "Missing Library",
                requiredBy: result.groups.required,
                library: result.groups.library,
            });
        }
        else if ((result = unavailableVersion.exec(line))) {
            this.errors.push({
                category: "library",
                logLine: lineNumber,
                failure_group: "Installation",
                type: "Missing Library",
                library: result.groups.library,
                version: result.groups.version,
            });
        }
    };
    return JsParser;
}(Parser_1.default));
exports.default = JsParser;
