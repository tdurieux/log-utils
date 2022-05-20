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
                nbTest: parseInt(result.groups.nbTest),
                nbFailure: parseInt(result.groups.failure),
                nbError: parseInt(result.groups.error),
                nbSkipped: parseInt(result.groups.skipped),
                time: parseFloat(result.groups.time),
            });
        }
        else if ((result = moduleNotFound.exec(line))) {
            this.errors.push({
                failure_group: "Installation",
                category: "library",
                type: "Missing Library",
                library: result.groups.library,
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
