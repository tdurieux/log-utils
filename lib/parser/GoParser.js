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
Object.defineProperty(exports, "__esModule", { value: true });
var Parser_1 = require("./Parser");
var test1 = new RegExp("--- PASS: ([^ ]+) ?(\\(([0-9.,:]+)([^\t]+)\\))?");
var test2 = new RegExp("--- FAIL: ([^ ]+) ?(\\(([0-9.,:]+)([^\t]+)\\))?");
var test3 = new RegExp("ok[ \t]+([^\t]+)[ \t]+([0-9.,:]+)([^\t]+)[ \t]+([^\t]+)");
var test4 = new RegExp("FAIL[ \t]+([^ ^\t]+)([ \t]+([0-9.,:]+)([^\t]+))?");
var test5 = new RegExp("--- SKIP:(.+)");
var dep1 = new RegExp("gimme: given '([^ ]+)' but no release for '([^ ]+)' found");
var GoParser = /** @class */ (function (_super) {
    __extends(GoParser, _super);
    function GoParser() {
        return _super.call(this, "GoParser", ["go"]) || this;
    }
    GoParser.prototype.parse = function (line, lineNumber) {
        var result = null;
        if ((result = test1.exec(line))) {
            this.tool = "gotest";
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result[1],
                body: "",
                nbTest: 1,
                nbFailure: 0,
                nbError: 0,
                nbSkipped: 0,
                time: parseFloat(result[3]),
            });
        }
        else if ((result = test2.exec(line))) {
            this.tool = "gotest";
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result[1],
                body: "",
                nbTest: 1,
                nbFailure: 1,
                nbError: 0,
                nbSkipped: 0,
                time: parseFloat(result[3]),
            });
        }
        else if ((result = test3.exec(line))) {
            this.tool = "gotest";
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
        else if ((result = test4.exec(line))) {
            this.tool = "gotest";
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: 1,
                nbFailure: 0,
                nbError: 0,
                nbSkipped: 0,
                time: 0,
            });
        }
        else if ((result = test5.exec(line))) {
            this.tool = "gotest";
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result[1],
                body: "",
                nbTest: 1,
                nbFailure: 1,
                nbError: 0,
                nbSkipped: 1,
                time: parseFloat(result[3]),
            });
        }
        else if ((result = dep1.exec(line))) {
            this.errors.push({
                failure_group: "Installation",
                category: "dependency",
                type: "Dependency not found",
                message: result[0],
                logLine: lineNumber,
            });
        }
    };
    return GoParser;
}(Parser_1.default));
exports.default = GoParser;
