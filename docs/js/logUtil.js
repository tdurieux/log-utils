(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.logUtil = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanLog = cleanLog;
exports.isEmpty = isEmpty;
exports.lines = lines;
exports.normalizeLog = normalizeLog;
exports.parseLog = parseLog;
exports.toRemove = exports.startWith = exports.properties = void 0;
var _ansiRegex = _interopRequireDefault(require("ansi-regex"));
var _index = _interopRequireDefault(require("./parser/index.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const properties = [/(hostname:).*/g, /(version:).*/g, /(instance:).*/g, /(startup:).*/g, /(travis-build version:).*/g, /(process ).*/g,
// /(Get|Ign|Hit):\d+/g,
// /(Err:)\d+/g,
/(container|Running in|--->) [0-9a-f]+/g, /(\/tmp\/tmp\.)[^ ]+/g, /(socket )[^ ]+/g];
exports.properties = properties;
const startWith = ["Get", "Ign", "Hit", "Receiving objects:", "Resolving deltas:", "Unpacking objects:", "Reading package lists...", "Fetched", "Updating files:", "This take some time...", "travis_time:", "travis_fold", "remote:", "/home/travis/", "...", "###", "Progress"];
exports.startWith = startWith;
const toRemove = [
// date
// /.{3}, +(\d{1,2}) +.{3} (\d{1,4}) (\d{1,2}):(\d{1,2}):(\d{1,2}) +\+(\d{1,2})/g,
// /.{3}, +(\d{1,2}):(\d{1,2}):(\d{1,2}) \+(\d+)/g,
// /(\d+)\.(\d+):(\d+):(\d+)\.(\d+)/g,
// /(\d+)-(\d+)-(\d+) (\d{1,2}):(\d{1,2}):(\d+)/g,
// /(\d+)\/(\d{1,2})\/(\d+) (\d{1,2}):(\d{1,2}):(\d+) (PM|AM|pm|am)/g,
// /(\d{1,2}):(\d{1,2}):(\d{1,2})/g,
// date
/(\d{1,4})(-|\/| )(\d{1,2})(-|\/| )(\d{1,4})( |T)?/g,
// time
/(\d{1,2}):(\d{1,2}):(\d{1,2})((\.|\+|,)(\d{1,7})Z?)?( (PM|AM|pm|am))?( [A-Z]{3})?/g,
// /\d{1,2}:\d{1,2}:\d{1,2}( [A-Z]{3})?/g,
// Wed Oct 09 01:10:19 UTC 2019
/.{3},?( .{3})? +(\d{1,2})( +.{3})?( |,)+(\d{1,4})/g,
// travis stuffs
/\((\d+)\/(\d+)\)/g,
// java object id
/(\@|\$\$)[0-9a-z]+(\:|{|,|]| )/g,
// ids
/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/, /(\d{5,})/g, /([0-9a-f]{10,})/g,
// duration
/\d+:\d+ min/gi, /(-->) +(\d+)%/g, /([\d\.]+)m?s/gi, /([0-9\.]+)M=0s/gi, /([0-9\,\.]+) ?(kb|mb|m|b)(\/s)?/gi, /([0-9\.]+) (seconds|secs|s|sec)/g, /(▉|█|▋)+/g, /={3,}>? */g, /(\[|\|)\d+\/\d+(\]||\|)/g,
// ip
/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g, /\d{1,2} ?%/g];
/**
 * Check if a string is empty or if it is a comment
 * @param str the string to test
 * @returns true if the file is empty
 */
exports.toRemove = toRemove;
function isEmpty(str) {
  const trimmedLine = str.trim();
  return trimmedLine.length == 0 || trimmedLine == "" || trimmedLine[1] == "%" || trimmedLine[2] == "%";
}
/**
 * Split a string into lines
 * @param str the string to split
 * @returns an array of lines
 */
function lines(str) {
  return str.split(/\r\n|(?!\r\n)[\n-\r\x85\u2028\u2029]/);
}
/**
 * Normalize the log file
 * @param log the log to normalize
 * @returns a normalized log
 */
function normalizeLog(log) {
  const output = [];
  line: for (let line of lines(log)) {
    line = line.trim();
    if (isEmpty(line)) {
      continue;
    }
    for (const property of properties) {
      line = line.replace(property, "$1");
    }
    for (const property of toRemove) {
      line = line.replace(property, "");
    }
    if (isEmpty(line)) {
      continue line;
    }
    output.push(line.trim());
  }
  return output.join("\n");
}
/**
 * Clean a log file by removing useless lines
 *
 * @param input the log to clean
 * @returns a cleaned log
 */
function cleanLog(input) {
  if (input == null) {
    return null;
  }
  const log = input.replace((0, _ansiRegex.default)(), "");
  if (log == null) return null;
  const output = [];
  for (let line of lines(log)) {
    if (line.includes("\b")) {
      const cs = [];
      for (let i = 0; i < line.length; i++) {
        if (line[i] == "\b") {
          // remove the previous character
          cs.pop();
        } else {
          cs.push(line[i]);
        }
      }
      line = cs.join("");
    }
    output.push(line.trim());
  }
  return output.join("\n");
}
/**
 * Parses a log file and returns useful information such as test results or errors
 *
 * @param input the log to parse
 * @returns
 */
function parseLog(input) {
  return (0, _index.default)(input);
}

},{"./parser/index.js":11,"ansi-regex":12}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Parser = _interopRequireDefault(require("./Parser.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const compilationError = new RegExp("(?<category>[a-zA-Z]+)\\[(?<id>[0-9]+)\\] (?<message>[^:]+): (?<parameter>.+)");
const interactiveLogin = new RegExp("Error: Cannot perform an interactive login from a non TTY device");
// CMake 3.4 or higher is required.  You are running version 3.1.3
const cmakeVersionProblem = new RegExp("CMake (?<expected>[0-9.]+) or higher is required.  You are running version (?<actual>[0-9.]+)");
// [error] org.xmlaxAXParseException; lineNumber: 6; columnNumber: 3; The element type "hr" must be terminated by the matching end-tag "".
const genericError = new RegExp("\\[error\\] (?<name>[^;]+); lineNumber: (?<line>[0-9]+); columnNumber: (?<column>[0-9]+); (?<message>.+)");
class GenericParser extends _Parser.default {
  constructor() {
    super("GenericParser", []);
  }
  parse(line, lineNumber) {
    var _a, _b, _c, _d, _e, _f, _g;
    let result = null;
    if (result = compilationError.exec(line)) {
      this.errors.push({
        type: "Compilation error",
        failure_group: "Compilation",
        message: (_a = result.groups) === null || _a === void 0 ? void 0 : _a.message,
        parameter: (_b = result.groups) === null || _b === void 0 ? void 0 : _b.parameter,
        logLine: lineNumber
      });
    } else if (result = interactiveLogin.exec(line)) {
      this.errors.push({
        category: "bash",
        failure_group: "Execution",
        type: "No interactive operation allowed",
        logLine: lineNumber
      });
    } else if (result = cmakeVersionProblem.exec(line)) {
      this.errors.push({
        category: "compilation",
        failure_group: "Compilation",
        type: "Invalid cmake version",
        actual: (_c = result.groups) === null || _c === void 0 ? void 0 : _c.actual,
        expected: (_d = result.groups) === null || _d === void 0 ? void 0 : _d.expected,
        logLine: lineNumber
      });
    } else if (result = genericError.exec(line)) {
      this.errors.push({
        type: "generic",
        failure_group: "Execution",
        message: (_e = result.groups) === null || _e === void 0 ? void 0 : _e.message,
        line: parseInt(((_f = result.groups) === null || _f === void 0 ? void 0 : _f.line) || ""),
        column: parseInt(((_g = result.groups) === null || _g === void 0 ? void 0 : _g.column) || ""),
        logLine: lineNumber
      });
    }
  }
}
exports.default = GenericParser;

},{"./Parser.js":8}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Parser = _interopRequireDefault(require("./Parser.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const test1 = new RegExp("--- PASS: ([^ ]+) ?(\\(([0-9.,:]+)([^\t]+)\\))?");
const test2 = new RegExp("--- FAIL: ([^ ]+) ?(\\(([0-9.,:]+)([^\t]+)\\))?");
const test3 = new RegExp("ok[ \t]+([^\t]+)[ \t]+([0-9.,:]+)([^\t]+)[ \t]+([^\t]+)");
const test4 = new RegExp("FAIL[ \t]+([^ ^\t]+)([ \t]+([0-9.,:]+)([^\t]+))?");
const test5 = new RegExp("--- SKIP:(.+)");
const dep1 = new RegExp("gimme: given '([^ ]+)' but no release for '([^ ]+)' found");
class GoParser extends _Parser.default {
  constructor() {
    super("GoParser", ["go"]);
  }
  parse(line, lineNumber) {
    let result = null;
    if (result = test1.exec(line)) {
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
        time: parseFloat(result[3])
      });
    } else if (result = test2.exec(line)) {
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
        time: parseFloat(result[3])
      });
    } else if (result = test3.exec(line)) {
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
        time: parseFloat(result[2])
      });
    } else if (result = test4.exec(line)) {
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
        time: 0
      });
    } else if (result = test5.exec(line)) {
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
        time: parseFloat(result[3])
      });
    } else if (result = dep1.exec(line)) {
      this.errors.push({
        failure_group: "Installation",
        category: "dependency",
        type: "Dependency not found",
        message: result[0],
        logLine: lineNumber
      });
    }
  }
}
exports.default = GoParser;

},{"./Parser.js":8}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Parser = _interopRequireDefault(require("./Parser.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const testNoAssert = new RegExp("✖ (.*) Test finished without running any assertions");
const testPassed = new RegExp("(✔|✓) ([^\\(]+)( \\(([0-9\\.]+)(.+)\\))?$");
const test2 = new RegExp("(ok|ko) ([0-9]+) (.*)$");
const test3 = new RegExp("Executed ([0-9]+) of ([0-9]+) (.*) \\(([0-9\\.]*) secs / ([0-9\\.]*) secs\\)");
const test4 = new RegExp("    ✗ (?<test>.*)");
const test5 = new RegExp("^FAIL (?<test>.*)");
// Spec Files:	 5 passed, 2 failed, 7 total (1 completed) in
const testSummary1 = /Spec Files:\W*(?<passed>[0-9]+) passed, (?<failed>[0-9]+) failed, (?<total>[0-9]+) total/;
const error = new RegExp("(.+):([0-9]+):([0-9]+) - error ([A-Z1-9]+): (.+)");
const endMocha = new RegExp("([1-9]+) passing (.*)\\(([1-9]+)(.*)s\\)$");
const unavailableVersion = new RegExp("No matching version found for (?<library>[^@]+)@(?<version>.+)");
const unavailablePackage = new RegExp('error Couldn\'t find package "(?<library>[^"]+)" required by "(?<required>[^"]+)"');
class JsParser extends _Parser.default {
  constructor() {
    super("JSParser", ["js", "node"]);
    this.startingMocha = false;
    this.totalTime = 0;
  }
  parse(line, lineNumber) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    if (this.tool == null && line.indexOf("mocha ") != -1) {
      this.tool = "mocha";
      this.startingMocha = true;
      this.totalTime = 0;
    }
    let result;
    if (result = testNoAssert.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[1],
        body: "",
        nbTest: 1,
        nbFailure: 0,
        nbError: 1,
        nbSkipped: 0,
        time: 0
      });
    } else if (this.startingMocha && (result = testPassed.exec(line))) {
      let time = 0;
      if (result[4] != null) {
        time = parseFloat(result[4]);
        if (result[5] == "ms") {
          time *= 0.001;
        } else if (result[5] == "m") {
          time *= 60;
        }
      }
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[2],
        body: "",
        nbTest: 1,
        nbFailure: 0,
        nbError: 0,
        nbSkipped: 0,
        time: time
      });
    } else if (result = test2.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[3],
        body: "",
        nbTest: 1,
        nbFailure: result[1] != "ok" ? 1 : 0,
        nbError: 0,
        nbSkipped: 0,
        time: 0
      });
    } else if (result = test3.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: 1,
        nbFailure: result[3] != "SUCCESS" ? 1 : 0,
        nbError: 0,
        nbSkipped: 0,
        time: parseFloat(result[5])
      });
    } else if (result = test4.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: (_a = result.groups) === null || _a === void 0 ? void 0 : _a.test,
        body: "",
        nbTest: 1,
        nbFailure: 1,
        nbError: 0,
        nbSkipped: 0
      });
    } else if (result = test5.exec(line)) {
      this.tool = "jasmine2";
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: (_b = result.groups) === null || _b === void 0 ? void 0 : _b.test,
        body: "",
        nbTest: 1,
        nbFailure: 1,
        nbError: 0,
        nbSkipped: 0
      });
    } else if (result = testSummary1.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: parseInt((_c = result.groups) === null || _c === void 0 ? void 0 : _c.total),
        nbFailure: parseInt((_d = result.groups) === null || _d === void 0 ? void 0 : _d.failed),
        nbError: 0,
        nbSkipped: parseInt(((_e = result.groups) === null || _e === void 0 ? void 0 : _e.total) || "") - parseInt(((_f = result.groups) === null || _f === void 0 ? void 0 : _f.passed) || "") - parseInt(((_g = result.groups) === null || _g === void 0 ? void 0 : _g.failed) || "")
      });
    } else if (result = error.exec(line)) {
      this.errors.push({
        failure_group: "Execution",
        logLine: lineNumber,
        file: result[1],
        line: parseInt(result[2]),
        message: result[5]
      });
    } else if (result = endMocha.exec(line)) {
      this.startingMocha = false;
      this.totalTime = parseFloat(result[3]);
    } else if (result = unavailablePackage.exec(line)) {
      this.errors.push({
        category: "library",
        logLine: lineNumber,
        failure_group: "Installation",
        type: "Missing Library",
        requiredBy: (_h = result.groups) === null || _h === void 0 ? void 0 : _h.required,
        library: (_j = result.groups) === null || _j === void 0 ? void 0 : _j.library
      });
    } else if (result = unavailableVersion.exec(line)) {
      this.errors.push({
        category: "library",
        logLine: lineNumber,
        failure_group: "Installation",
        type: "Missing Library",
        library: (_k = result.groups) === null || _k === void 0 ? void 0 : _k.library,
        version: (_l = result.groups) === null || _l === void 0 ? void 0 : _l.version
      });
    }
  }
}
exports.default = JsParser;

},{"./Parser.js":8}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Parser = _interopRequireDefault(require("./Parser.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const independents = [{
  element: new RegExp("\\[(?<name>[^\\]]+)\\]: (?<status>[A-Z]+) in (?<class>.*)"),
  type: "test",
  failure_group: "Test"
}, {
  element: new RegExp("(?<nbTest>[0-9]+) tests completed, (?<failed>[0-9]+) failed, ((?<skipped>[0-9]+) skipped)?"),
  type: "test",
  failure_group: "Test"
}, {
  element: new RegExp(new RegExp(" (?<name>[a-zA-Z0-9\\-_]+)\\(\\) (?<status>↷|■|✔)( (?<message>.*))?")),
  type: "test",
  failure_group: "Test"
}, {
  element: new RegExp("Running test:( test)? (?<name>.+)\\((?<class>.+)\\)"),
  type: "test",
  failure_group: "Test"
}, {
  element: new RegExp("(?<status>Failed) test (?<name>.+) \\[(?<class>.+)\\] with exception: "),
  type: "test",
  failure_group: "Test"
}, {
  element: new RegExp("\\[javac\\] (?<file>[^:]+):(?<line>[0-9]+): error: (?<message>.*)"),
  type: "Compilation",
  failure_group: "Compilation"
}, {
  element: new RegExp("Error: Could not find or load main class (?<file>.+)"),
  type: "Execution",
  failure_group: "Execution"
}, {
  element: new RegExp("\\[WARNING\\] Missing header in: (?<file>.+)"),
  type: "License",
  failure_group: "Chore"
}, {
  element: new RegExp("\\[ERROR\\] (?<file>[^:]+):\\[(?<line>[0-9]+)(,(?<column>[0-9]+))?\\] (?<message>\\((.+)\\) (.+))."),
  type: "Checkstyle",
  failure_group: "Chore"
}, {
  element: new RegExp("\\[checkstyle\\]( \\[ERROR\\])? (?<file>[^:]+):(?<line>[0-9]+):((?<column>[0-9]+):)? (?<message>.+)"),
  type: "Checkstyle",
  failure_group: "Chore"
}, {
  element: new RegExp("Could not find (?<group>[^: ]+):(?<artifact>[^: ]+)(:(pom|jar))?:(?<version>[^ ]+)."),
  type: "Missing library",
  failure_group: "Installation"
}, {
  element: new RegExp("Could not transfer artifact (?<group>[^: ]+):(?<artifact>[^: ]+)(:(pom|jar))?:(?<version>[^ ]+)"),
  type: "Missing library",
  failure_group: "Installation"
}, {
  element: new RegExp("Failure to find (?<group>[^: ]+):(?<artifact>[^: ]+)(:(pom|jar))?:(?<version>[^ ]+)"),
  type: "Missing library",
  failure_group: "Installation"
}, {
  element: new RegExp("PMD Failure: (?<file>[^:]+):(?<line>[0-9]+) Rule:(?<rule>.+) Priority:(?<priority>[0-9]+) (?<message>.+)"),
  type: "Checkstyle",
  failure_group: "Chore"
}, {
  element: new RegExp("(?<nbTest>[0-9]+) tests? completed, (?<failure>[0-9]+) failed"),
  type: "test",
  failure_group: "Test"
}, {
  element: new RegExp("Tests run: (?<nbTest>[0-9]+), Failures: (?<failure>[0-9]+), Errors: (?<error>[0-9]+), Skipped: (?<skipped>[0-9]+)(, Time elapsed: (?<time>[0-9.]+) ?s)?"),
  type: "test",
  failure_group: "Test"
}];
const groups = [{
  name: "audit",
  type: "Checkstyle",
  failure_group: "Chore",
  start: new RegExp("\\[INFO\\] Starting audit.+"),
  end: new RegExp("Audit done.+"),
  element: new RegExp("(?<file>[^:]+):(?<line>[0-9]+):((?<column>[0-9]+):)? (?<message>.+)")
}, {
  name: "checkstyle",
  type: "Checkstyle",
  failure_group: "Chore",
  start: new RegExp("\\[INFO\\] There (is|are) (.+) errors? reported by Checkstyle .+ with (.+) ruleset."),
  end: new RegExp("\\[INFO\\] -+"),
  element: new RegExp("\\[ERROR\\] (?<file>[^:]+):\\[(?<line>[0-9]+)(,(?<column>[0-9]+))?\\] (?<message>.+).")
}, {
  name: "compile",
  type: "Compilation",
  failure_group: "Compilation",
  start: new RegExp("\\[ERROR\\] COMPILATION ERROR"),
  end: new RegExp("location\\: +(.+)"),
  element: new RegExp("\\[ERROR\\] (?<file>[^:]+):\\[(?<line>[0-9]+)(,(?<column>[0-9]+))?\\] (?<message>.+)")
}, {
  name: "compile",
  type: "Compilation",
  failure_group: "Compilation",
  start: new RegExp("\\[ERROR\\] COMPILATION ERROR"),
  end: new RegExp("location\\: +(.+)"),
  element: new RegExp("(?<file>[^:]+):\\[(?<line>[0-9]+)(,(?<column>[0-9]+))?\\] error: (?<message>.+)")
}, {
  name: "compile",
  type: "Compilation",
  failure_group: "Compilation",
  start: new RegExp("\\[ERROR\\] COMPILATION ERROR"),
  end: new RegExp("location\\: +(.+)"),
  element: new RegExp("(?<file>.+):(?<line>[0-9]+): error: (?<message>.+)")
}, {
  name: "test",
  type: "test",
  failure_group: "Test",
  start: new RegExp("Running (?<name>.*Tests?.*)$"),
  end: new RegExp("Tests run: (?<nbTest>[0-9]+), Failures: (?<failure>[0-9]+), Errors: (?<error>[0-9]+), Skipped: (?<skipped>[0-9]+)(, Time elapsed: (?<time>[0-9.]+) ?s)?"),
  element: new RegExp("(?<all_line>.+)")
}, {
  name: "graddle",
  type: "test",
  failure_group: "Test",
  start: new RegExp("([0-9]+)\\) (?<name>.+) \\((?<class>.+)\\)"),
  end: new RegExp("Tests run: (?<nbTest>[0-9]+),  Failures: (?<failure>[0-9]+)"),
  element: new RegExp("(?<all_line>.+)")
}, {
  name: "graddle2",
  type: "test",
  failure_group: "Test",
  start: new RegExp("Executing test (?<name>.+) \\[(?<class>.+)\\]"),
  end: new RegExp("(((?<nbTest>[0-9]+) tests completed, (?<failure>[0-9]+) failed)|(Executing test (?<name>.+) \\[(?<class>.+)\\]))"),
  startIsEnd: true,
  element: new RegExp("(?<all_line>.+)")
}, {
  name: "compare",
  type: "Compare version",
  failure_group: "Chore",
  start: new RegExp("\\[INFO\\] Comparing to version: "),
  end: new RegExp("\\[INFO\\] -+"),
  element: new RegExp("\\[ERROR\\] (?<id>[0-9]+): (?<file>.+): ")
}];
class JavaParser extends _Parser.default {
  constructor() {
    super("JavaParser", ["java"]);
    this.inGroup = null;
    this.currentElement = null;
  }
  parse(line, lineNumber) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    for (let group of groups) {
      if (this.inGroup != null && group.name != this.inGroup) {
        continue;
      }
      if (this.inGroup == null) {
        const result = group.start.exec(line);
        if (result != null) {
          this.inGroup = group.name;
          if (group.type == "test") {
            this.currentElement = {
              name: (_a = result.groups) === null || _a === void 0 ? void 0 : _a.name,
              class: (_b = result.groups) === null || _b === void 0 ? void 0 : _b.class,
              body: "",
              nbTest: 1,
              nbFailure: 0,
              nbError: 0,
              nbSkipped: 0,
              time: 0
            };
            this.tests.push(this.currentElement);
          }
          return;
        }
      } else {
        let result = group.end.exec(line);
        if (result != null) {
          if (this.currentElement != null && result.groups && ((_c = result.groups) === null || _c === void 0 ? void 0 : _c.nbTest)) {
            this.currentElement.nbTest = parseInt((_d = result.groups) === null || _d === void 0 ? void 0 : _d.nbTest);
            this.currentElement.nbFailure = parseInt((_e = result.groups) === null || _e === void 0 ? void 0 : _e.failure);
            this.currentElement.nbError = parseInt((_f = result.groups) === null || _f === void 0 ? void 0 : _f.error);
            this.currentElement.nbSkipped = parseInt((_g = result.groups) === null || _g === void 0 ? void 0 : _g.skipped);
            this.currentElement.time = parseInt((_h = result.groups) === null || _h === void 0 ? void 0 : _h.time);
          }
          if (group.name == "graddle2" && this.currentElement.body != null && this.currentElement.body != "") {
            if (this.currentElement.body.indexOf("FAIL") != -1) {
              this.currentElement.nbFailure++;
            } else if (this.currentElement.body.indexOf("ERROR") != -1) {
              this.currentElement.nbError++;
            }
          }
          if (group.startIsEnd === true && group.type == "test" && !((_j = result.groups) === null || _j === void 0 ? void 0 : _j.nbTest)) {
            this.currentElement = {
              name: (_k = result.groups) === null || _k === void 0 ? void 0 : _k.name,
              class: (_l = result.groups) === null || _l === void 0 ? void 0 : _l.class,
              body: "",
              nbTest: 1,
              nbFailure: 0,
              nbError: 0,
              nbSkipped: 0,
              time: 0
            };
            this.tests.push(this.currentElement);
          } else {
            this.inGroup = null;
          }
          return;
        }
        result = group.element.exec(line);
        if (result != null) {
          if ((_m = result.groups) === null || _m === void 0 ? void 0 : _m.all_line) {
            this.currentElement.body += ((_o = result.groups) === null || _o === void 0 ? void 0 : _o.all_line) + "\n";
          } else {
            const output = {
              type: group.type
            };
            for (let key in result.groups) {
              if (result.groups[key] != null) {
                output[key] = result.groups[key];
              }
            }
            this.errors.push(output);
          }
          return;
        }
      }
    }
    if (this.inGroup) {
      return;
    }
    for (const independent of independents) {
      const result = independent.element.exec(line);
      if (result != null) {
        const output = {
          type: independent.type,
          logLine: lineNumber
        };
        for (let key in result.groups) {
          if (result.groups[key] != null) {
            let value = result.groups[key];
            if (Number(value).toString() == value) {
              value = Number(value);
            }
            output[key] = value;
          }
        }
        if (independent.type == "test") {
          delete output.type;
          if (output.status) {
            console.log(output.status);
          }
          if (!output.nbTest) {
            output.nbTest = 1;
          }
          this.tests.push(output);
        } else {
          this.errors.push(output);
        }
        return;
      }
    }
  }
}
exports.default = JavaParser;

},{"./Parser.js":8}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Parser = _interopRequireDefault(require("./Parser.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const test = new RegExp("([0-9]+)/([0-9]+) Test +#([0-9]+): (.+) \\.+ +([^ ]+) +(.+) sec");
// ✗ testDisable_ShouldCallWithAPNSToken_WhenCalledExplicitlyWithAPNSTokenParameter, Asynchronous wait failed: Exceeded timeout of , with unfulfilled expectations: "clientsDestroyCompletion".
const test1 = new RegExp(" ✗ (?<test>[^,]+), (?<message>.+)");
// Executed 550 tests, with 1 failure (0 unexpected) in 140.378 (140.898) seconds
const testSummary = new RegExp("Executed (?<executed>[0-9]+) tests, with (?<failure>[0-9]+) failure ((?<unexpected>[0-9]+) unexpected) in (?<duration>[0-9-.]+)");
class ObjcParser extends _Parser.default {
  constructor() {
    super("ObjcParser", ["objc", "objective-c"]);
  }
  parse(line, lineNumber) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    let result;
    if (result = test.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[4],
        body: "",
        nbTest: 1,
        nbFailure: result[5] != "Passed" ? 1 : 0,
        nbError: 0,
        nbSkipped: 0,
        time: parseFloat(result[6])
      });
    } else if (result = test1.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: (_b = (_a = result.groups) === null || _a === void 0 ? void 0 : _a.test) !== null && _b !== void 0 ? _b : "",
        body: (_d = (_c = result.groups) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : "",
        nbTest: 1,
        nbFailure: 1,
        nbError: 0,
        nbSkipped: 0
      });
    } else if (result = testSummary.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: (_f = (_e = result.groups) === null || _e === void 0 ? void 0 : _e.test) !== null && _f !== void 0 ? _f : "",
        body: (_h = (_g = result.groups) === null || _g === void 0 ? void 0 : _g.message) !== null && _h !== void 0 ? _h : "",
        nbTest: parseInt((_k = (_j = result.groups) === null || _j === void 0 ? void 0 : _j.executed) !== null && _k !== void 0 ? _k : "0"),
        nbFailure: parseInt((_m = (_l = result.groups) === null || _l === void 0 ? void 0 : _l.failure) !== null && _m !== void 0 ? _m : "0"),
        nbError: 0,
        nbSkipped: 0,
        time: parseFloat(((_o = result.groups) === null || _o === void 0 ? void 0 : _o.duration) || "0")
      });
    }
  }
}
exports.default = ObjcParser;

},{"./Parser.js":8}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Parser = _interopRequireDefault(require("./Parser.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const timeRegex = new RegExp("Time: ([0-9\\.]+) ([^,]+), Memory: ([0-9\\.]+)(.+)");
const time2Regex = new RegExp("Time: ([0-9]+:[0-9]+), Memory: ([0-9\\.]+)(.+)");
const testResults = new RegExp("Tests: ([0-9]+), Assertions: ([0-9]+)(, Errors: ([0-9]+))?(, Failures: ([0-9]+))?(, Skipped: ([0-9]+))?(, Incomplete: ([0-9]+))?.");
const testResultsOk = new RegExp("OK \\(([0-9]+) tests, ([0-9]+) assertions\\)");
const missingPackage = new RegExp("The requested package (?<library>[^ ]+) could not be found in any version");
const missingPackage2 = new RegExp('No releases available for package "(?<library>[^"]+)"');
class PhpParser extends _Parser.default {
  constructor() {
    super("PhpParser", ["php"]);
    this.currentTest = null;
  }
  parse(line, lineNumber) {
    var _a, _b;
    let test;
    if (test = timeRegex.exec(line)) {
      this.currentTest = {
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: 0,
        nbFailure: 0,
        nbError: 0,
        nbSkipped: 0,
        time: parseInt(test[1]) * (test[2] == "minutes" ? 60 : 1)
      };
    } else if (test = time2Regex.exec(line)) {
      this.currentTest = {
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: 0,
        nbFailure: 0,
        nbError: 0,
        nbSkipped: 0,
        time: parseInt(test[1]) * 60 + parseInt(test[2])
      };
    } else if (test = testResults.exec(line)) {
      if (this.currentTest == null) {
        this.currentTest = {
          failure_group: "Test",
          logLine: lineNumber,
          name: "",
          body: "",
          nbTest: parseInt(test[1]),
          nbFailure: test[6] ? parseInt(test[6]) : 0,
          nbError: test[4] ? parseInt(test[4]) : 0,
          nbSkipped: test[8] ? parseInt(test[8]) : 0
        };
      }
      this.currentTest.nbTest = parseInt(test[1]);
      this.currentTest.nbAssertion = parseInt(test[2]);
      this.currentTest.nbError = test[4] ? parseInt(test[4]) : 0;
      this.currentTest.nbFailure = test[6] ? parseInt(test[6]) : 0;
      this.currentTest.nbSkipped = test[8] ? parseInt(test[8]) : 0;
      this.currentTest.nbIncomplete = test[10] ? parseInt(test[10]) : 0;
      this.tests.push(this.currentTest);
      this.currentTest = null;
    } else if (test = testResultsOk.exec(line)) {
      if (this.currentTest == null) {
        this.currentTest = {
          failure_group: "Test",
          logLine: lineNumber,
          name: "",
          body: "",
          nbTest: parseInt(test[1]),
          nbAssertion: parseInt(test[2]),
          nbError: 0,
          nbFailure: 0,
          nbSkipped: 0
        };
      }
      if (this.currentTest !== null) this.tests.push(this.currentTest);
      this.currentTest = null;
    } else if (test = missingPackage.exec(line)) {
      this.errors.push({
        category: "library",
        failure_group: "Installation",
        type: "Missing Library",
        library: (_a = test.groups) === null || _a === void 0 ? void 0 : _a.library,
        logLine: lineNumber
      });
    } else if (test = missingPackage2.exec(line)) {
      this.errors.push({
        category: "library",
        failure_group: "Installation",
        type: "Missing Library",
        library: (_b = test.groups) === null || _b === void 0 ? void 0 : _b.library,
        logLine: lineNumber
      });
    }
  }
}
exports.default = PhpParser;

},{"./Parser.js":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class Parser {
  constructor(name, languages) {
    this.name = name;
    this.languages = languages;
    this.tests = [];
    this.errors = [];
    this.tool = null;
  }
  isSupportedLanguage(language) {
    if (this.languages.length == 0) {
      return true;
    }
    return this.languages.includes(language.toLowerCase());
  }
}
exports.default = Parser;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Parser = _interopRequireDefault(require("./Parser.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const test = new RegExp("^(.+)::(.+) ([^ ]+) +\\[(.+)\\%\\]");
const test2 = new RegExp("^([^ ]+) +(.*): ([0-9]+) tests \\((.*) secs\\)");
const test3 = new RegExp("^([^ ]+) ([\\.sF]+)( .*\\[.*)?$");
const test4 = new RegExp("1: \\{1\\} ([^ ]+) \\[(.*)s\\] ... (.*)$");
const test5 = new RegExp("^(PASS|FAIL): (.+)");
const testError1 = new RegExp("(ERROR|FAIL): (.+)( \\((.+)\\))?");
const testError2 = new RegExp("(.+):([0-9]+): error: (.+)");
const summaryPyTest = new RegExp("==+ (([0-9]+) passed)(.+) in (.+) seconds ==+");
const summaryTest2 = new RegExp("Ran ([0-9]+) tests in (.+)s");
const summaryTest3 = new RegExp("FAILED \\(SKIP=([0-9]+), errors=([0-9]+), failures=([0-9]+)\\)");
const summaryTest4 = new RegExp("SUMMARY +([0-9]+)/([0-9]+) tasks and ([0-9]+)/([0-9]+) tests failed");
const summaryTest5 = new RegExp("== ([0-9]+) failed, ([0-9]+) passed, ([0-9]+) skipped, ([0-9]+) pytest-warnings in ([0-9.]+) seconds ===");
const summaryTest6 = new RegExp("(?<failed>[0-9]+) failed, (?<passed>[0-9]+) passed(, (?<skipped>[0-9]+) skipped)?(, (?<warning>[0-9]+) warnings) in (?<time>[0-9.]+)s");
const moduleNotFound = new RegExp("ModuleNotFoundError: No module named '(?<library>[^']+)'");
const testStartWithBody = new RegExp("^(.+)::(test_.+)");
const startPyflakes = new RegExp("pyflakes verktyg");
const pyflakesStyleError = new RegExp("(.+):([0-9]+): (.+)");
const compilationError = new RegExp("SyntaxError: invalid syntax");
class PyParser extends _Parser.default {
  constructor() {
    super("PyParser", ["python"]);
    this.currentTest = null;
    this.totalTime = 0;
    this.inPyflakes = false;
  }
  parse(line, lineNumber) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    let result = test.exec(line);
    if (result) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[1] + "::" + result[2],
        body: "",
        nbTest: 1,
        nbFailure: result[3].indexOf("FAIL") != -1 ? 1 : 0,
        nbError: 0,
        nbSkipped: 0,
        time: 0
      });
    } else if (result = summaryPyTest.exec(line)) {
      this.tool = "pytest";
      this.totalTime = parseFloat(result[4]);
    } else if (result = summaryTest3.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: 0,
        nbFailure: parseInt(result[3]),
        nbError: parseInt(result[2]),
        nbSkipped: parseInt(result[1]),
        time: 0
      });
    } else if (result = summaryTest4.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: parseInt(result[4]),
        nbFailure: parseInt(result[3]),
        nbError: 0,
        nbSkipped: 0,
        time: 0
      });
    } else if (result = summaryTest5.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: parseInt(result[2]) + parseInt(result[1]),
        nbError: 0,
        nbFailure: parseInt(result[1]),
        nbWarning: parseInt(result[4]),
        nbSkipped: parseInt(result[3]),
        time: parseInt(result[5])
      });
    } else if (result = summaryTest6.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: parseInt((_b = (_a = result.groups) === null || _a === void 0 ? void 0 : _a.passed) !== null && _b !== void 0 ? _b : "0") + parseInt((_d = (_c = result.groups) === null || _c === void 0 ? void 0 : _c.failed) !== null && _d !== void 0 ? _d : "0"),
        nbFailure: parseInt((_f = (_e = result.groups) === null || _e === void 0 ? void 0 : _e.failed) !== null && _f !== void 0 ? _f : "0"),
        nbError: 0,
        nbWarning: parseInt((_h = (_g = result.groups) === null || _g === void 0 ? void 0 : _g.warning) !== null && _h !== void 0 ? _h : "0"),
        nbSkipped: parseInt((_k = (_j = result.groups) === null || _j === void 0 ? void 0 : _j.skipped) !== null && _k !== void 0 ? _k : "0"),
        time: parseFloat((_m = (_l = result.groups) === null || _l === void 0 ? void 0 : _l.time) !== null && _m !== void 0 ? _m : "0")
      });
    } else if (result = summaryTest2.exec(line)) {
      this.tool = "django";
      this.totalTime = parseFloat(result[2]);
    } else if (result = startPyflakes.exec(line)) {
      this.inPyflakes = true;
    } else if (this.inPyflakes === true && (result = pyflakesStyleError.exec(line))) {
      this.inPyflakes = true;
      this.errors.push({
        failure_group: "Checkstyle",
        logLine: lineNumber,
        file: result[1],
        line: parseInt(result[2]),
        message: result[3],
        type: "Checkstyle"
      });
    } else if (result = compilationError.exec(line)) {
      this.errors.push({
        failure_group: "Compilation",
        type: "Compilation error",
        logLine: lineNumber
      });
    } else if (result = moduleNotFound.exec(line)) {
      this.errors.push({
        logLine: lineNumber,
        category: "library",
        failure_group: "Installation",
        type: "Missing Library",
        library: (_o = result.groups) === null || _o === void 0 ? void 0 : _o.library
      });
    } else if (result = test2.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[2],
        body: "",
        nbTest: parseInt(result[3]),
        nbFailure: 0,
        nbError: result[1] !== "SUCCESS" ? 1 : 0,
        nbSkipped: 0,
        time: parseFloat(result[4])
      });
    } else if (line.indexOf("Download") == -1 && (result = test3.exec(line))) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[1],
        body: "",
        nbTest: result[2].length,
        nbFailure: (result[2].match(/F/g) || []).length,
        nbError: 0,
        nbSkipped: (result[2].match(/\\s/g) || []).length,
        time: 0
      });
    } else if (result = test4.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[1],
        body: "",
        nbTest: 1,
        nbFailure: 0,
        nbError: 0,
        nbSkipped: 0,
        time: parseFloat(result[2])
      });
    } else if (result = test5.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: result[2],
        body: "",
        nbTest: 1,
        nbFailure: result[1] == "FAIL" ? 1 : 0,
        nbError: 0,
        nbSkipped: 0,
        time: 0
      });
    } else if (result = testError1.exec(line)) {
      let name = result[2];
      if (result[4]) {
        name = result[4] + "::" + result[2];
      }
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: name,
        body: "",
        nbTest: 1,
        nbFailure: 1,
        nbError: 0,
        nbSkipped: 0,
        time: 0
      });
    } else if (result = testError2.exec(line)) {
      let name = result[1] + "::" + result[2];
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: name,
        body: result[3],
        nbTest: 1,
        nbFailure: 1,
        nbError: 0,
        nbSkipped: 0,
        time: 0
      });
    } else if (result = testStartWithBody.exec(line)) {
      this.currentTest = {
        failure_group: "Test",
        logLine: lineNumber,
        name: result[1] + "::" + result[2],
        body: "",
        nbTest: 1,
        nbFailure: 0,
        nbError: 0,
        nbSkipped: 0,
        time: 0
      };
    } else {
      if (this.currentTest != null) {
        if (line == "PASSED" || line == "FAILED") {
          if (line == "FAILED") {
            this.currentTest.nbFailure = 1;
          }
          this.tests.push(this.currentTest);
          this.currentTest = null;
        } else {
          this.currentTest.body += line + "\n";
        }
      }
    }
  }
}
exports.default = PyParser;

},{"./Parser.js":8}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Parser = _interopRequireDefault(require("./Parser.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const test = new RegExp("^([\\.sF\\*]{4,})$");
const test2 = new RegExp("Tests run: (?<nbTest>[0-9]+), Failures: (?<failure>[0-9]+), Errors: (?<error>[0-9]+), Skipped: (?<skipped>[0-9]+)(, Time elapsed: (?<time>[0-9.]+) ?s)?");
const moduleNotFound = new RegExp("ModuleNotFoundError: No module named '(?<library>[^']+)'");
const notGem = new RegExp("No Gemfile found, skipping bundle install");
class RubyParser extends _Parser.default {
  constructor() {
    super("RubyParser", ["ruby"]);
  }
  parse(line, lineNumber) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    let result = null;
    if (result = test.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: result[1].length,
        nbFailure: (result[1].match(/F/g) || []).length,
        nbError: 0,
        nbSkipped: (result[1].match(/\\s/g) || []).length,
        time: 0
      });
    } else if (result = test2.exec(line)) {
      this.tests.push({
        failure_group: "Test",
        logLine: lineNumber,
        name: "",
        body: "",
        nbTest: parseInt((_b = (_a = result.groups) === null || _a === void 0 ? void 0 : _a.nbTest) !== null && _b !== void 0 ? _b : "0"),
        nbFailure: parseInt((_d = (_c = result.groups) === null || _c === void 0 ? void 0 : _c.failure) !== null && _d !== void 0 ? _d : "0"),
        nbError: parseInt((_f = (_e = result.groups) === null || _e === void 0 ? void 0 : _e.error) !== null && _f !== void 0 ? _f : "0"),
        nbSkipped: parseInt((_h = (_g = result.groups) === null || _g === void 0 ? void 0 : _g.skipped) !== null && _h !== void 0 ? _h : "0"),
        time: parseFloat((_k = (_j = result.groups) === null || _j === void 0 ? void 0 : _j.time) !== null && _k !== void 0 ? _k : "0")
      });
    } else if (result = moduleNotFound.exec(line)) {
      this.errors.push({
        failure_group: "Installation",
        category: "library",
        type: "Missing Library",
        library: (_l = result.groups) === null || _l === void 0 ? void 0 : _l.library,
        logLine: lineNumber
      });
    } else if (result = notGem.exec(line)) {
      this.errors.push({
        failure_group: "Installation",
        category: "dependency_manager",
        type: "No Gemfile found",
        logLine: lineNumber
      });
    }
  }
}
exports.default = RubyParser;

},{"./Parser.js":8}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseLog;
var _index = require("../index.js");
var _GenericParser = _interopRequireDefault(require("./GenericParser.js"));
var _GoParser = _interopRequireDefault(require("./GoParser.js"));
var _JSParser = _interopRequireDefault(require("./JSParser.js"));
var _JavaParser = _interopRequireDefault(require("./JavaParser.js"));
var _ObjcParser = _interopRequireDefault(require("./ObjcParser.js"));
var _PHPParser = _interopRequireDefault(require("./PHPParser.js"));
var _PythonParser = _interopRequireDefault(require("./PythonParser.js"));
var _RubyParser = _interopRequireDefault(require("./RubyParser.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function parseLog(log) {
  var _a, _b, _c, _d, _e;
  if (log == null) throw new Error("log is not defined");
  const job = {};
  try {
    /**
     * @type {Parser[]}
     */
    const parsers = [new _JavaParser.default(),
    //   new MavenParser(),
    new _JSParser.default(), new _PythonParser.default(), new _ObjcParser.default(), new _PHPParser.default(), new _RubyParser.default(), new _GoParser.default(), new _GenericParser.default()];
    let exitCode = null;
    let tool = null;
    const tests = [];
    const errors = [];
    let commit = null;
    let lineStart = 0;
    let lineNumber = 0;
    line: for (let i = 0; i < log.length; i++) {
      if (i == log.length - 1 || log[i] == "\n") {
        const line = log.slice(lineStart, i + 1).trim();
        let result = null;
        lineStart = i + 1;
        lineNumber++;
        if ((0, _index.isEmpty)(line)) continue;
        for (let property of _index.startWith) {
          if (line.indexOf(property) > -1) {
            continue line;
          }
        }
        if ((!job.config || !job.config.language) && line.indexOf("Build language: ") == 0) {
          if (!job.config) {
            job.config = {
              language: line.replace("Build language: ", "")
            };
          }
        } else if (line.indexOf("* [new ref]") != -1) {
          commit = line.substring(line.indexOf("* [new ref]")).trim();
          commit = commit.substring(0, commit.indexOf(" "));
        } else if (line.indexOf("$ git checkout -qf ") != -1) {
          commit = line.replace("$ git checkout -qf ", "");
        } else if (line.indexOf("git fetch origin ") != -1) {
          //console.log(line)
        } else if (line.indexOf("Done. Your build exited with ") != -1) {
          exitCode = parseInt(line.substring("Done. Your build exited with ".length, line.length - 1));
        } else if (line.indexOf("fatal: Could not read from remote repository.") != -1) {
          errors.push({
            failure_group: "Installation",
            type: "Unable to clone",
            logLine: lineNumber
          });
        } else if (result = line.match(/fatal: unable to access '(?<repo>[^']+)'/)) {
          errors.push({
            failure_group: "Installation",
            category: "credential",
            type: "Unable to clone",
            message: (_a = result.groups) === null || _a === void 0 ? void 0 : _a.file,
            logLine: lineNumber
          });
        } else if (result = line.match(/fatal: Authentication failed for '(?<file>[^']+)'/)) {
          errors.push({
            failure_group: "Installation",
            category: "credential",
            type: "Unable to clone",
            message: (_b = result.groups) === null || _b === void 0 ? void 0 : _b.file,
            logLine: lineNumber
          });
        } else if (line.indexOf("Error: retrieving gpg key timed out.") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "timeout",
            type: "[gpg] Unable to install dependencies",
            logLine: lineNumber
          });
        } else if (line.indexOf("Hash Sum mismatch") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Incorrect hash sum",
            logLine: lineNumber
          });
          // Could not connect to apt.cache.travis-ci.com:80 (), connection timed out
        } else if (line.indexOf("Could not connect to ") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Unable to install dependencies",
            logLine: lineNumber
          });
          // error: component download failed for
        } else if (line.indexOf("error: component download failed for ") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Unable to install dependencies",
            logLine: lineNumber
          });
        } else if (line.indexOf("Unable to connect to ") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Unable to install dependencies",
            logLine: lineNumber
          });
        } else if (line.indexOf("Connection timed out") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "timeout",
            type: "Connection timed out",
            logLine: lineNumber
          });
        } else if (line.indexOf("The TLS connection was non-properly terminated.") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Connection terminated",
            logLine: lineNumber
          });
        } else if (line.indexOf("The job exceeded the maximum time limit for jobs, and has been terminated.") != -1) {
          errors.push({
            failure_group: "Travis",
            category: "travis",
            type: "Execution timeout",
            logLine: lineNumber
          });
        } else if (line.indexOf("No output has been received in the last 10m") != -1) {
          errors.push({
            failure_group: "Travis",
            category: "travis",
            type: "Log timeout",
            logLine: lineNumber
          });
        } else if (result = line.match(/Failed to download (file|index): (?<file>[^ ]+)/)) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            library: (_c = result.groups) === null || _c === void 0 ? void 0 : _c.file,
            type: "Missing Library",
            logLine: lineNumber
          });
        } else if (result = line.match(/Unable to locate package (?<file>[^ ]+)/)) {
          errors.push({
            failure_group: "Installation",
            category: "library",
            type: "Missing Library",
            library: (_d = result.groups) === null || _d === void 0 ? void 0 : _d.file,
            logLine: lineNumber
          });
        } else if (result = line.match(/error: failed to push some refs to '(?<file>[^']+)'/)) {
          errors.push({
            failure_group: "Installation",
            category: "credential",
            type: "Unable to push",
            message: (_e = result.groups) === null || _e === void 0 ? void 0 : _e.file,
            logLine: lineNumber
          });
        } else if (line.toLowerCase().indexOf("address already in use") > -1) {
          errors.push({
            failure_group: "Execution",
            category: "execution",
            type: "port already in use",
            logLine: lineNumber
          });
        }
        for (let parser of parsers) {
          if (job.config && !parser.isSupportedLanguage(job.config.language)) {
            continue;
          }
          try {
            parser.parse(line, lineNumber);
          } catch (e) {
            console.error(e, parser.name, lineNumber);
          }
        }
      }
    }
    for (let parser of parsers) {
      Array.prototype.push.apply(tests, parser.tests);
      Array.prototype.push.apply(errors, parser.errors);
      if (parser.tool != null && tool === null) {
        tool = parser.tool;
      }
    }
    const reasons = errors.concat([]);
    for (let test of tests) {
      if (test.nbFailure > 0) {
        reasons.push({
          failure_group: "Test",
          category: "test",
          message: test.name,
          type: "Test failure",
          logLine: test.logLine
        });
      }
      if (test.nbError > 0) {
        reasons.push({
          failure_group: "Test",
          category: "test",
          message: test.name,
          type: "Test error",
          logLine: test.logLine
        });
      }
    }
    return {
      tests: tests,
      errors: errors,
      tool: tool,
      exitCode,
      reasons,
      commit
    };
  } catch (e) {
    throw new Error(`Unable to parse log file: ${e}`);
  }
}

},{"../index.js":1,"./GenericParser.js":2,"./GoParser.js":3,"./JSParser.js":4,"./JavaParser.js":5,"./ObjcParser.js":6,"./PHPParser.js":7,"./PythonParser.js":9,"./RubyParser.js":10}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ansiRegex;
function ansiRegex({
  onlyFirst = false
} = {}) {
  const pattern = ['[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)', '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'].join('|');
  return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

},{}]},{},[1])(1)
});
