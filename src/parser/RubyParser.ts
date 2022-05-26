import Parser from "./Parser.js";

const test = new RegExp("^([\\.sF\\*]{4,})$");
const test2 = new RegExp(
  "Tests run: (?<nbTest>[0-9]+), Failures: (?<failure>[0-9]+), Errors: (?<error>[0-9]+), Skipped: (?<skipped>[0-9]+)(, Time elapsed: (?<time>[0-9.]+) ?s)?"
);

const moduleNotFound = new RegExp(
  "ModuleNotFoundError: No module named '(?<library>[^']+)'"
);
const notGem = new RegExp("No Gemfile found, skipping bundle install");

export default class RubyParser extends Parser {
  constructor() {
    super("RubyParser", ["ruby"]);
  }

  parse(line: string, lineNumber: number) {
    let result = null;
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
    } else if ((result = test2.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: parseInt(result.groups?.nbTest ?? "0"),
        nbFailure: parseInt(result.groups?.failure ?? "0"),
        nbError: parseInt(result.groups?.error ?? "0"),
        nbSkipped: parseInt(result.groups?.skipped ?? "0"),
        time: parseFloat(result.groups?.time ?? "0"),
      });
    } else if ((result = moduleNotFound.exec(line))) {
      this.errors.push({
        failure_group: "Installation",
        category: "library",
        type: "Missing Library",
        library: result.groups?.library,
        logLine: lineNumber,
      });
    } else if ((result = notGem.exec(line))) {
      this.errors.push({
        failure_group: "Installation",
        category: "dependency_manager",
        type: "No Gemfile found",
        logLine: lineNumber,
      });
    }
  }
}
