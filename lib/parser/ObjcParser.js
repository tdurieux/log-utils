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
                name: result.groups.test,
                body: result.groups.message,
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
                name: result.groups.test,
                body: result.groups.message,
                nbTest: result.groups.executed,
                nbFailure: result.groups.failure,
                nbError: 0,
                nbSkipped: 0,
                time: parseFloat(result.groups.duration),
            });
        }
    };
    return ObjcParser;
}(Parser_1.default));
exports.default = ObjcParser;
