import Parser from "./Parser.js";

const compilationError = new RegExp(
  "(?<category>[a-zA-Z]+)\\[(?<id>[0-9]+)\\] (?<message>[^:]+): (?<parameter>.+)"
);

const interactiveLogin = new RegExp(
  "Error: Cannot perform an interactive login from a non TTY device"
);

// CMake 3.4 or higher is required.  You are running version 3.1.3
const cmakeVersionProblem = new RegExp(
  "CMake (?<expected>[0-9.]+) or higher is required.  You are running version (?<actual>[0-9.]+)"
);

// [error] org.xmlaxAXParseException; lineNumber: 6; columnNumber: 3; The element type "hr" must be terminated by the matching end-tag "".
const genericError = new RegExp(
  "\\[error\\] (?<name>[^;]+); lineNumber: (?<line>[0-9]+); columnNumber: (?<column>[0-9]+); (?<message>.+)"
);

export default class GenericParser extends Parser {
  constructor() {
    super("GenericParser", []);
  }

  parse(line: string, lineNumber: number) {
    let result = null;
    if ((result = compilationError.exec(line))) {
      this.errors.push({
        type: "Compilation error",
        failure_group: "Compilation",
        message: result.groups?.message,
        parameter: result.groups?.parameter,
        logLine: lineNumber,
      });
    } else if ((result = interactiveLogin.exec(line))) {
      this.errors.push({
        category: "bash",
        failure_group: "Execution",
        type: "No interactive operation allowed",
        logLine: lineNumber,
      });
    } else if ((result = cmakeVersionProblem.exec(line))) {
      this.errors.push({
        category: "compilation",
        failure_group: "Compilation",
        type: "Invalid cmake version",
        actual: result.groups?.actual,
        expected: result.groups?.expected,
        logLine: lineNumber,
      });
    } else if ((result = genericError.exec(line))) {
      this.errors.push({
        type: "generic",
        failure_group: "Execution",
        message: result.groups?.message,
        line: parseInt(result.groups?.line || ""),
        column: parseInt(result.groups?.column || ""),
        logLine: lineNumber,
      });
    }
  }
}
