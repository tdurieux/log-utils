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
        var result = null;
        if ((result = compilationError.exec(line))) {
            this.errors.push({
                type: "Compilation error",
                failure_group: "Compilation",
                message: result.groups.message,
                parameter: result.groups.parameter,
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
                actual: result.groups.actual,
                expected: result.groups.expected,
                logLine: lineNumber,
            });
        }
        else if ((result = genericError.exec(line))) {
            this.errors.push({
                type: "generic",
                failure_group: "Execution",
                message: result.groups.message,
                line: parseInt(result.groups.line),
                column: parseInt(result.groups.column),
                logLine: lineNumber,
            });
        }
    };
    return GenericParser;
}(Parser_1.default));
exports.default = GenericParser;
