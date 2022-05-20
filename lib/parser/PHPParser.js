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
var timeRegex = new RegExp("Time: ([0-9\\.]+) ([^,]+), Memory: ([0-9\\.]+)(.+)");
var time2Regex = new RegExp("Time: ([0-9]+:[0-9]+), Memory: ([0-9\\.]+)(.+)");
var testResults = new RegExp("Tests: ([0-9]+), Assertions: ([0-9]+)(, Errors: ([0-9]+))?(, Failures: ([0-9]+))?(, Skipped: ([0-9]+))?(, Incomplete: ([0-9]+))?.");
var testResultsOk = new RegExp("OK \\(([0-9]+) tests, ([0-9]+) assertions\\)");
var missingPackage = new RegExp("The requested package (?<library>[^ ]+) could not be found in any version");
var missingPackage2 = new RegExp('No releases available for package "(?<library>[^"]+)"');
var PhpParser = /** @class */ (function (_super) {
    __extends(PhpParser, _super);
    function PhpParser() {
        var _this = _super.call(this, "PhpParser", ["php"]) || this;
        _this.currentTest = null;
        return _this;
    }
    PhpParser.prototype.parse = function (line, lineNumber) {
        var test;
        if ((test = timeRegex.exec(line))) {
            this.currentTest = {
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: 0,
                nbFailure: 0,
                nbError: 0,
                nbSkipped: 0,
                time: parseInt(test[1]) * (test[2] == "minutes" ? 60 : 1),
            };
        }
        else if ((test = time2Regex.exec(line))) {
            this.currentTest = {
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: 0,
                nbFailure: 0,
                nbError: 0,
                nbSkipped: 0,
                time: parseInt(test[1]) * 60 + parseInt(test[2]),
            };
        }
        else if ((test = testResults.exec(line))) {
            if (this.currentTest == null) {
                this.currentTest = {
                    failure_group: "Test",
                    logLine: lineNumber,
                    name: "",
                    body: "",
                    nbTest: parseInt(test[1]),
                    nbFailure: test[6] ? parseInt(test[6]) : 0,
                    nbError: test[4] ? parseInt(test[4]) : 0,
                    nbSkipped: test[8] ? parseInt(test[8]) : 0,
                };
            }
            this.currentTest.nbTest = parseInt(test[1]);
            this.currentTest.nbAssertion = parseInt(test[2]);
            this.currentTest.nbError = test[4] ? parseInt(test[4]) : 0;
            this.currentTest.nbFailure = test[6] ? parseInt(test[6]) : 0;
            this.currentTest.nbSkipped = test[8] ? parseInt(test[8]) : 0;
            this.currentTest.nbIncomplete = test[10] ? parseInt(test[10]) : 0;
            this.tests.push(this.currentTest);
            this.currentTest = null;
        }
        else if ((test = testResultsOk.exec(line))) {
            if (this.currentTest == null) {
                this.currentTest = {
                    failure_group: "Test",
                    logLine: lineNumber,
                    name: "",
                    body: "",
                    nbTest: parseInt(test[1]),
                };
            }
            this.currentTest.nbTest = parseInt(test[1]);
            this.currentTest.nbAssertion = parseInt(test[2]);
            this.tests.push(this.currentTest);
            this.currentTest = null;
        }
        else if ((test = missingPackage.exec(line))) {
            this.errors.push({
                category: "library",
                failure_group: "Installation",
                type: "Missing Library",
                library: test.groups.library,
                logLine: lineNumber,
            });
        }
        else if ((test = missingPackage2.exec(line))) {
            this.errors.push({
                category: "library",
                failure_group: "Installation",
                type: "Missing Library",
                library: test.groups.library,
                logLine: lineNumber,
            });
        }
    };
    return PhpParser;
}(Parser_1.default));
exports.default = PhpParser;
