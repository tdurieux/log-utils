import Parser from "./Parser.js";
const compilationError = new RegExp("(?<category>[a-zA-Z]+)\\[(?<id>[0-9]+)\\] (?<message>[^:]+): (?<parameter>.+)");
const interactiveLogin = new RegExp("Error: Cannot perform an interactive login from a non TTY device");
// CMake 3.4 or higher is required.  You are running version 3.1.3
const cmakeVersionProblem = new RegExp("CMake (?<expected>[0-9.]+) or higher is required.  You are running version (?<actual>[0-9.]+)");
// [error] org.xmlaxAXParseException; lineNumber: 6; columnNumber: 3; The element type "hr" must be terminated by the matching end-tag "".
const genericError = new RegExp("\\[error\\] (?<name>[^;]+); lineNumber: (?<line>[0-9]+); columnNumber: (?<column>[0-9]+); (?<message>.+)");
export default class GenericParser extends Parser {
    constructor() {
        super("GenericParser", []);
    }
    parse(line, lineNumber) {
        var _a, _b, _c, _d, _e, _f, _g;
        let result = null;
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
    }
}
//# sourceMappingURL=GenericParser.js.map