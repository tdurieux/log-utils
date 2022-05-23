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
var compilationError = new RegExp("(?<category>[a-zA-Z]+)\\[(?<id>[0-9]+)\\] (?<message>[^:]+): (?<parameter>.+)");
var interactiveLogin = new RegExp("Error: Cannot perform an interactive login from a non TTY device");
// CMake 3.4 or higher is required.  You are running version 3.1.3
var cmakeVersionProblem = new RegExp("CMake (?<expected>[0-9.]+) or higher is required.  You are running version (?<actual>[0-9.]+)");
// [error] org.xmlaxAXParseException; lineNumber: 6; columnNumber: 3; The element type "hr" must be terminated by the matching end-tag "".
var genericError = new RegExp("\\[error\\] (?<name>[^;]+); lineNumber: (?<line>[0-9]+); columnNumber: (?<column>[0-9]+); (?<message>.+)");
var GenericParser = /** @class */ (function (_super) {
    __extends(GenericParser, _super);
    function GenericParser() {
        return _super.call(this, "GenericParser", []) || this;
    }
    GenericParser.prototype.parse = function (line, lineNumber) {
        var _a, _b, _c, _d, _e, _f, _g;
        var result = null;
        if ((result = compilationError.exec(line))) {
            this.errors.push({
                type: "Compilation error",
                failure_group: "Compilation",
                message: (_a = result.groups) === null || _a === void 0 ? void 0 : _a.message,
                parameter: (_b = result.groups) === null || _b === void 0 ? void 0 : _b.parameter,
                logLine: lineNumber,
            });
        }
        else if ((result = interactiveLogin.exec(line))) {
            this.errors.push({
                category: "bash",
                failure_group: "Execution",
                type: "No interactive operation allowed",
                logLine: lineNumber,
            });
        }
        else if ((result = cmakeVersionProblem.exec(line))) {
            this.errors.push({
                category: "compilation",
                failure_group: "Compilation",
                type: "Invalid cmake version",
                actual: (_c = result.groups) === null || _c === void 0 ? void 0 : _c.actual,
                expected: (_d = result.groups) === null || _d === void 0 ? void 0 : _d.expected,
                logLine: lineNumber,
            });
        }
        else if ((result = genericError.exec(line))) {
            this.errors.push({
                type: "generic",
                failure_group: "Execution",
                message: (_e = result.groups) === null || _e === void 0 ? void 0 : _e.message,
                line: parseInt(((_f = result.groups) === null || _f === void 0 ? void 0 : _f.line) || ""),
                column: parseInt(((_g = result.groups) === null || _g === void 0 ? void 0 : _g.column) || ""),
                logLine: lineNumber,
            });
        }
    };
    return GenericParser;
}(Parser_1.default));
exports.default = GenericParser;
