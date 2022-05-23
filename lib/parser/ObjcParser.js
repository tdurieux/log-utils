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
var test = new RegExp("([0-9]+)/([0-9]+) Test +#([0-9]+): (.+) \\.+ +([^ ]+) +(.+) sec");
// ✗ testDisable_ShouldCallWithAPNSToken_WhenCalledExplicitlyWithAPNSTokenParameter, Asynchronous wait failed: Exceeded timeout of , with unfulfilled expectations: "clientsDestroyCompletion".
var test1 = new RegExp(" ✗ (?<test>[^,]+), (?<message>.+)");
// Executed 550 tests, with 1 failure (0 unexpected) in 140.378 (140.898) seconds
var testSummary = new RegExp("Executed (?<executed>[0-9]+) tests, with (?<failure>[0-9]+) failure ((?<unexpected>[0-9]+) unexpected) in (?<duration>[0-9-.]+)");
var ObjcParser = /** @class */ (function (_super) {
    __extends(ObjcParser, _super);
    function ObjcParser() {
        return _super.call(this, "ObjcParser", ["objc", "objective-c"]) || this;
    }
    ObjcParser.prototype.parse = function (line, lineNumber) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var result;
        if ((result = test.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result[4],
                body: "",
                nbTest: 1,
                nbFailure: result[5] != "Passed" ? 1 : 0,
                nbError: 0,
                nbSkipped: 0,
                time: parseFloat(result[6]),
            });
        }
        else if ((result = test1.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: (_b = (_a = result.groups) === null || _a === void 0 ? void 0 : _a.test) !== null && _b !== void 0 ? _b : "",
                body: (_d = (_c = result.groups) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : "",
                nbTest: 1,
                nbFailure: 1,
                nbError: 0,
                nbSkipped: 0,
            });
        }
        else if ((result = testSummary.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: (_f = (_e = result.groups) === null || _e === void 0 ? void 0 : _e.test) !== null && _f !== void 0 ? _f : "",
                body: (_h = (_g = result.groups) === null || _g === void 0 ? void 0 : _g.message) !== null && _h !== void 0 ? _h : "",
                nbTest: parseInt((_k = (_j = result.groups) === null || _j === void 0 ? void 0 : _j.executed) !== null && _k !== void 0 ? _k : "0"),
                nbFailure: parseInt((_m = (_l = result.groups) === null || _l === void 0 ? void 0 : _l.failure) !== null && _m !== void 0 ? _m : "0"),
                nbError: 0,
                nbSkipped: 0,
                time: parseFloat(((_o = result.groups) === null || _o === void 0 ? void 0 : _o.duration) || "0"),
            });
        }
    };
    return ObjcParser;
}(Parser_1.default));
exports.default = ObjcParser;
