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
var independents = [
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
var groups = [
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
var JavaParser = /** @class */ (function (_super) {
    __extends(JavaParser, _super);
    function JavaParser() {
        var _this = _super.call(this, "JavaParser", ["java"]) || this;
        _this.inGroup = null;
        _this.currentElement = null;
        return _this;
    }
    JavaParser.prototype.parse = function (line, lineNumber) {
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var group = groups_1[_i];
            if (this.inGroup != null && group.name != this.inGroup) {
                continue;
            }
            if (this.inGroup == null) {
                var result = group.start.exec(line);
                if (result != null) {
                    this.inGroup = group.name;
                    if (group.type == "test") {
                        this.currentElement = {
                            name: result.groups.name,
                            class: result.groups.class,
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
                var result = group.end.exec(line);
                if (result != null) {
                    if (this.currentElement != null &&
                        result.groups &&
                        result.groups.nbTest) {
                        this.currentElement.nbTest = parseInt(result.groups.nbTest);
                        this.currentElement.nbFailure = parseInt(result.groups.failure);
                        this.currentElement.nbError = parseInt(result.groups.error);
                        this.currentElement.nbSkipped = parseInt(result.groups.skipped);
                        this.currentElement.time = parseInt(result.groups.time);
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
                        !result.groups.nbTest) {
                        this.currentElement = {
                            name: result.groups.name,
                            class: result.groups.class,
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
                    if (result.groups.all_line) {
                        this.currentElement.body += result.groups.all_line + '\n';
                    }
                    else {
                        var output = {
                            type: group.type,
                        };
                        for (var key in result.groups) {
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
        for (var _a = 0, independents_1 = independents; _a < independents_1.length; _a++) {
            var independent = independents_1[_a];
            var result = independent.element.exec(line);
            if (result != null) {
                var output = {
                    type: independent.type,
                    logLine: lineNumber,
                };
                for (var key in result.groups) {
                    if (result.groups[key] != null) {
                        var value = result.groups[key];
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
    };
    return JavaParser;
}(Parser_1.default));
exports.default = JavaParser;
module.exports.Parser = JavaParser;
