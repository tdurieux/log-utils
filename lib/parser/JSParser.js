import Parser from "./Parser.js";
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
export default class JsParser extends Parser {
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
        if ((result = testNoAssert.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result[1],
                body: "",
                nbTest: 1,
                nbFailure: 0,
                nbError: 1,
                nbSkipped: 0,
                time: 0,
            });
        }
        else if (this.startingMocha && (result = testPassed.exec(line))) {
            let time = 0;
            if (result[4] != null) {
                time = parseFloat(result[4]);
                if (result[5] == "ms") {
                    time *= 0.001;
                }
                else if (result[5] == "m") {
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
                time: time,
            });
        }
        else if ((result = test2.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: result[3],
                body: "",
                nbTest: 1,
                nbFailure: result[1] != "ok" ? 1 : 0,
                nbError: 0,
                nbSkipped: 0,
                time: 0,
            });
        }
        else if ((result = test3.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: 1,
                nbFailure: result[3] != "SUCCESS" ? 1 : 0,
                nbError: 0,
                nbSkipped: 0,
                time: parseFloat(result[5]),
            });
        }
        else if ((result = test4.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: (_a = result.groups) === null || _a === void 0 ? void 0 : _a.test,
                body: "",
                nbTest: 1,
                nbFailure: 1,
                nbError: 0,
                nbSkipped: 0,
            });
        }
        else if ((result = test5.exec(line))) {
            this.tool = "jasmine2";
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: (_b = result.groups) === null || _b === void 0 ? void 0 : _b.test,
                body: "",
                nbTest: 1,
                nbFailure: 1,
                nbError: 0,
                nbSkipped: 0,
            });
        }
        else if ((result = testSummary1.exec(line))) {
            this.tests.push({
                failure_group: "Test",
                logLine: lineNumber,
                name: "",
                body: "",
                nbTest: parseInt((_c = result.groups) === null || _c === void 0 ? void 0 : _c.total),
                nbFailure: parseInt((_d = result.groups) === null || _d === void 0 ? void 0 : _d.failed),
                nbError: 0,
                nbSkipped: parseInt(((_e = result.groups) === null || _e === void 0 ? void 0 : _e.total) || "") -
                    parseInt(((_f = result.groups) === null || _f === void 0 ? void 0 : _f.passed) || "") -
                    parseInt(((_g = result.groups) === null || _g === void 0 ? void 0 : _g.failed) || ""),
            });
        }
        else if ((result = error.exec(line))) {
            this.errors.push({
                failure_group: "Execution",
                logLine: lineNumber,
                file: result[1],
                line: parseInt(result[2]),
                message: result[5],
            });
        }
        else if ((result = endMocha.exec(line))) {
            this.startingMocha = false;
            this.totalTime = parseFloat(result[3]);
        }
        else if ((result = unavailablePackage.exec(line))) {
            this.errors.push({
                category: "library",
                logLine: lineNumber,
                failure_group: "Installation",
                type: "Missing Library",
                requiredBy: (_h = result.groups) === null || _h === void 0 ? void 0 : _h.required,
                library: (_j = result.groups) === null || _j === void 0 ? void 0 : _j.library,
            });
        }
        else if ((result = unavailableVersion.exec(line))) {
            this.errors.push({
                category: "library",
                logLine: lineNumber,
                failure_group: "Installation",
                type: "Missing Library",
                library: (_k = result.groups) === null || _k === void 0 ? void 0 : _k.library,
                version: (_l = result.groups) === null || _l === void 0 ? void 0 : _l.version,
            });
        }
    }
}
//# sourceMappingURL=JSParser.js.map