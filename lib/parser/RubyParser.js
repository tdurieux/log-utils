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
var test = new RegExp("^([\\.sF\\*]{4,})$");
var test2 = new RegExp("Tests run: (?<nbTest>[0-9]+), Failures: (?<failure>[0-9]+), Errors: (?<error>[0-9]+), Skipped: (?<skipped>[0-9]+)(, Time elapsed: (?<time>[0-9.]+) ?s)?");
var moduleNotFound = new RegExp("ModuleNotFoundError: No module named '(?<library>[^']+)'");
var notGem = new RegExp("No Gemfile found, skipping bundle install");
var RubyParser = /** @class */ (function (_super) {
    __extends(RubyParser, _super);
    function RubyParser() {
        return _super.call(this, "RubyParser", ["ruby"]) || this;
    }
    RubyParser.prototype.parse = function (line, lineNumber) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var result = null;
        if ((result = test.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: result[1].length,
                nbFailure: (result[1].match(/F/g) || []).length,
                nbError: 0,
                nbSkipped: (result[1].match(/\\s/g) || []).length,
                time: 0,
            });
        }
        else if ((result = test2.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: parseInt((_b = (_a = result.groups) === null || _a === void 0 ? void 0 : _a.nbTest) !== null && _b !== void 0 ? _b : "0"),
                nbFailure: parseInt((_d = (_c = result.groups) === null || _c === void 0 ? void 0 : _c.failure) !== null && _d !== void 0 ? _d : "0"),
                nbError: parseInt((_f = (_e = result.groups) === null || _e === void 0 ? void 0 : _e.error) !== null && _f !== void 0 ? _f : "0"),
                nbSkipped: parseInt((_h = (_g = result.groups) === null || _g === void 0 ? void 0 : _g.skipped) !== null && _h !== void 0 ? _h : "0"),
                time: parseFloat((_k = (_j = result.groups) === null || _j === void 0 ? void 0 : _j.time) !== null && _k !== void 0 ? _k : "0"),
            });
        }
        else if ((result = moduleNotFound.exec(line))) {
            this.errors.push({
                failure_group: "Installation",
                category: "library",
                type: "Missing Library",
                library: (_l = result.groups) === null || _l === void 0 ? void 0 : _l.library,
                logLine: lineNumber,
            });
        }
        else if ((result = notGem.exec(line))) {
            this.errors.push({
                failure_group: "Installation",
                category: "dependency_manager",
                type: "No Gemfile found",
                logLine: lineNumber,
            });
        }
    };
    return RubyParser;
}(Parser_1.default));
exports.default = RubyParser;
