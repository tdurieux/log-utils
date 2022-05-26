import Parser from "./Parser.js";
const independents = [
    {
        element: new RegExp("\\[(?<name>[^\\]]+)\\]: (?<status>[A-Z]+) in (?<class>.*)"),
        type: "test",
        failure_group: "Test",
    },
    {
        element: new RegExp("(?<nbTest>[0-9]+) tests completed, (?<failed>[0-9]+) failed, ((?<skipped>[0-9]+) skipped)?"),
        type: "test",
        failure_group: "Test",
    },
    {
        element: new RegExp(new RegExp(" (?<name>[a-zA-Z0-9\\-_]+)\\(\\) (?<status>↷|■|✔)( (?<message>.*))?")),
        type: "test",
        failure_group: "Test",
    },
    {
        element: new RegExp("Running test:( test)? (?<name>.+)\\((?<class>.+)\\)"),
        type: "test",
        failure_group: "Test",
    },
    {
        element: new RegExp("(?<status>Failed) test (?<name>.+) \\[(?<class>.+)\\] with exception: "),
        type: "test",
        failure_group: "Test",
    },
    {
        element: new RegExp("\\[javac\\] (?<file>[^:]+):(?<line>[0-9]+): error: (?<message>.*)"),
        type: "Compilation",
        failure_group: "Compilation",
    },
    {
        element: new RegExp("Error: Could not find or load main class (?<file>.+)"),
        type: "Execution",
        failure_group: "Execution",
    },
    {
        element: new RegExp("\\[WARNING\\] Missing header in: (?<file>.+)"),
        type: "License",
        failure_group: "Chore",
    },
    {
        element: new RegExp("\\[ERROR\\] (?<file>[^:]+):\\[(?<line>[0-9]+)(,(?<column>[0-9]+))?\\] (?<message>\\((.+)\\) (.+))."),
        type: "Checkstyle",
        failure_group: "Chore",
    },
    {
        element: new RegExp("\\[checkstyle\\]( \\[ERROR\\])? (?<file>[^:]+):(?<line>[0-9]+):((?<column>[0-9]+):)? (?<message>.+)"),
        type: "Checkstyle",
        failure_group: "Chore",
    },
    {
        element: new RegExp("Could not find (?<group>[^: ]+):(?<artifact>[^: ]+)(:(pom|jar))?:(?<version>[^ ]+)."),
        type: "Missing library",
        failure_group: "Installation",
    },
    {
        element: new RegExp("Could not transfer artifact (?<group>[^: ]+):(?<artifact>[^: ]+)(:(pom|jar))?:(?<version>[^ ]+)"),
        type: "Missing library",
        failure_group: "Installation",
    },
    {
        element: new RegExp("Failure to find (?<group>[^: ]+):(?<artifact>[^: ]+)(:(pom|jar))?:(?<version>[^ ]+)"),
        type: "Missing library",
        failure_group: "Installation",
    },
    {
        element: new RegExp("PMD Failure: (?<file>[^:]+):(?<line>[0-9]+) Rule:(?<rule>.+) Priority:(?<priority>[0-9]+) (?<message>.+)"),
        type: "Checkstyle",
        failure_group: "Chore",
    },
    {
        element: new RegExp("(?<nbTest>[0-9]+) tests? completed, (?<failure>[0-9]+) failed"),
        type: "test",
        failure_group: "Test",
    },
    {
        element: new RegExp("Tests run: (?<nbTest>[0-9]+), Failures: (?<failure>[0-9]+), Errors: (?<error>[0-9]+), Skipped: (?<skipped>[0-9]+)(, Time elapsed: (?<time>[0-9.]+) ?s)?"),
        type: "test",
        failure_group: "Test",
    },
];
const groups = [
    {
        name: "audit",
        type: "Checkstyle",
        failure_group: "Chore",
        start: new RegExp("\\[INFO\\] Starting audit.+"),
        end: new RegExp("Audit done.+"),
        element: new RegExp("(?<file>[^:]+):(?<line>[0-9]+):((?<column>[0-9]+):)? (?<message>.+)"),
    },
    {
        name: "checkstyle",
        type: "Checkstyle",
        failure_group: "Chore",
        start: new RegExp("\\[INFO\\] There (is|are) (.+) errors? reported by Checkstyle .+ with (.+) ruleset."),
        end: new RegExp("\\[INFO\\] -+"),
        element: new RegExp("\\[ERROR\\] (?<file>[^:]+):\\[(?<line>[0-9]+)(,(?<column>[0-9]+))?\\] (?<message>.+)."),
    },
    {
        name: "compile",
        type: "Compilation",
        failure_group: "Compilation",
        start: new RegExp("\\[ERROR\\] COMPILATION ERROR"),
        end: new RegExp("location\\: +(.+)"),
        element: new RegExp("\\[ERROR\\] (?<file>[^:]+):\\[(?<line>[0-9]+)(,(?<column>[0-9]+))?\\] (?<message>.+)"),
    },
    {
        name: "compile",
        type: "Compilation",
        failure_group: "Compilation",
        start: new RegExp("\\[ERROR\\] COMPILATION ERROR"),
        end: new RegExp("location\\: +(.+)"),
        element: new RegExp("(?<file>[^:]+):\\[(?<line>[0-9]+)(,(?<column>[0-9]+))?\\] error: (?<message>.+)"),
    },
    {
        name: "compile",
        type: "Compilation",
        failure_group: "Compilation",
        start: new RegExp("\\[ERROR\\] COMPILATION ERROR"),
        end: new RegExp("location\\: +(.+)"),
        element: new RegExp("(?<file>.+):(?<line>[0-9]+): error: (?<message>.+)"),
    },
    {
        name: "test",
        type: "test",
        failure_group: "Test",
        start: new RegExp("Running (?<name>.*Tests?.*)$"),
        end: new RegExp("Tests run: (?<nbTest>[0-9]+), Failures: (?<failure>[0-9]+), Errors: (?<error>[0-9]+), Skipped: (?<skipped>[0-9]+)(, Time elapsed: (?<time>[0-9.]+) ?s)?"),
        element: new RegExp("(?<all_line>.+)"),
    },
    {
        name: "graddle",
        type: "test",
        failure_group: "Test",
        start: new RegExp("([0-9]+)\\) (?<name>.+) \\((?<class>.+)\\)"),
        end: new RegExp("Tests run: (?<nbTest>[0-9]+),  Failures: (?<failure>[0-9]+)"),
        element: new RegExp("(?<all_line>.+)"),
    },
    {
        name: "graddle2",
        type: "test",
        failure_group: "Test",
        start: new RegExp("Executing test (?<name>.+) \\[(?<class>.+)\\]"),
        end: new RegExp("(((?<nbTest>[0-9]+) tests completed, (?<failure>[0-9]+) failed)|(Executing test (?<name>.+) \\[(?<class>.+)\\]))"),
        startIsEnd: true,
        element: new RegExp("(?<all_line>.+)"),
    },
    {
        name: "compare",
        type: "Compare version",
        failure_group: "Chore",
        start: new RegExp("\\[INFO\\] Comparing to version: "),
        end: new RegExp("\\[INFO\\] -+"),
        element: new RegExp("\\[ERROR\\] (?<id>[0-9]+): (?<file>.+): "),
    },
];
export default class JavaParser extends Parser {
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
                            time: 0,
                        };
                        this.tests.push(this.currentElement);
                    }
                    return;
                }
            }
            else {
                let result = group.end.exec(line);
                if (result != null) {
                    if (this.currentElement != null &&
                        result.groups &&
                        ((_c = result.groups) === null || _c === void 0 ? void 0 : _c.nbTest)) {
                        this.currentElement.nbTest = parseInt((_d = result.groups) === null || _d === void 0 ? void 0 : _d.nbTest);
                        this.currentElement.nbFailure = parseInt((_e = result.groups) === null || _e === void 0 ? void 0 : _e.failure);
                        this.currentElement.nbError = parseInt((_f = result.groups) === null || _f === void 0 ? void 0 : _f.error);
                        this.currentElement.nbSkipped = parseInt((_g = result.groups) === null || _g === void 0 ? void 0 : _g.skipped);
                        this.currentElement.time = parseInt((_h = result.groups) === null || _h === void 0 ? void 0 : _h.time);
                    }
                    if (group.name == "graddle2" &&
                        this.currentElement.body != null &&
                        this.currentElement.body != "") {
                        if (this.currentElement.body.indexOf("FAIL") != -1) {
                            this.currentElement.nbFailure++;
                        }
                        else if (this.currentElement.body.indexOf("ERROR") != -1) {
                            this.currentElement.nbError++;
                        }
                    }
                    if (group.startIsEnd === true &&
                        group.type == "test" &&
                        !((_j = result.groups) === null || _j === void 0 ? void 0 : _j.nbTest)) {
                        this.currentElement = {
                            name: (_k = result.groups) === null || _k === void 0 ? void 0 : _k.name,
                            class: (_l = result.groups) === null || _l === void 0 ? void 0 : _l.class,
                            body: "",
                            nbTest: 1,
                            nbFailure: 0,
                            nbError: 0,
                            nbSkipped: 0,
                            time: 0,
                        };
                        this.tests.push(this.currentElement);
                    }
                    else {
                        this.inGroup = null;
                    }
                    return;
                }
                result = group.element.exec(line);
                if (result != null) {
                    if ((_m = result.groups) === null || _m === void 0 ? void 0 : _m.all_line) {
                        this.currentElement.body += ((_o = result.groups) === null || _o === void 0 ? void 0 : _o.all_line) + "\n";
                    }
                    else {
                        const output = {
                            type: group.type,
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
                    logLine: lineNumber,
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
                }
                else {
                    this.errors.push(output);
                }
                return;
            }
        }
    }
}
//# sourceMappingURL=JavaParser.js.map