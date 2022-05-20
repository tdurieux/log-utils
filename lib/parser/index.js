"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var GenericParser_1 = __importDefault(require("./GenericParser"));
var GoParser_1 = __importDefault(require("./GoParser"));
var JSParser_1 = __importDefault(require("./JSParser"));
var MavenParser_1 = __importDefault(require("./MavenParser"));
var JavaParser_1 = __importDefault(require("./JavaParser"));
var ObjcParser_1 = __importDefault(require("./ObjcParser"));
var PHPParser_1 = __importDefault(require("./PHPParser"));
var PythonParser_1 = __importDefault(require("./PythonParser"));
var RubyParser_1 = __importDefault(require("./RubyParser"));
function parseLog(log) {
    if (log == null)
        return null;
    var job = {};
    try {
        /**
         * @type {Parser[]}
         */
        var parsers = [
            new JavaParser_1.default(),
            new MavenParser_1.default(),
            new JSParser_1.default(),
            new PythonParser_1.default(),
            new ObjcParser_1.default(),
            new PHPParser_1.default(),
            new RubyParser_1.default(),
            new GoParser_1.default(),
            new GenericParser_1.default(),
        ];
        var exitCode = null;
        var tool = null;
        var tests = [];
        var errors = [];
        var commit = null;
        var lineStart = 0;
        var lineNumber = 0;
        line: for (var i = 0; i < log.length; i++) {
            if (i == log.length - 1 || log[i] == "\n") {
                var line = log.slice(lineStart, i + 1).trim();
                var result = null;
                lineStart = i + 1;
                lineNumber++;
                if ((0, __1.isEmpty)(line))
                    continue;
                for (var _i = 0, startWith_1 = __1.startWith; _i < startWith_1.length; _i++) {
                    var property = startWith_1[_i];
                    if (line.indexOf(property) > -1) {
                        continue line;
                    }
                }
                if ((!job.config || !job.config.language) &&
                    line.indexOf("Build language: ") == 0) {
                    if (!job.config) {
                        job.config = {
                            language: line.replace("Build language: ", ""),
                        };
                    }
                }
                else if (line.indexOf("$ git checkout -qf ") != -1) {
                    commit = line.replace("$ git checkout -qf ", "");
                }
                else if (line.indexOf("git fetch origin ") != -1) {
                    //console.log(line)
                }
                else if (line.indexOf("Done. Your build exited with ") != -1) {
                    exitCode = parseInt(line.substring("Done. Your build exited with ".length, line.length - 1));
                }
                else if (line.indexOf("fatal: Could not read from remote repository.") != -1) {
                    errors.push({
                        failure_group: "Installation",
                        type: "Unable to clone",
                        logLine: lineNumber,
                    });
                }
                else if ((result = line.match(/fatal: unable to access '(?<repo>[^']+)'/))) {
                    errors.push({
                        failure_group: "Installation",
                        category: "credential",
                        type: "Unable to clone",
                        message: result.groups.file,
                        logLine: lineNumber,
                    });
                }
                else if ((result = line.match(/fatal: Authentication failed for '(?<file>[^']+)'/))) {
                    errors.push({
                        failure_group: "Installation",
                        category: "credential",
                        type: "Unable to clone",
                        message: result.groups.file,
                        logLine: lineNumber,
                    });
                }
                else if (line.indexOf("Error: retrieving gpg key timed out.") != -1) {
                    errors.push({
                        failure_group: "Installation",
                        category: "timeout",
                        type: "[gpg] Unable to install dependencies",
                        logLine: lineNumber,
                    });
                }
                else if (line.indexOf("Hash Sum mismatch") != -1) {
                    errors.push({
                        failure_group: "Installation",
                        category: "connection",
                        type: "Incorrect hash sum",
                        logLine: lineNumber,
                    });
                    // Could not connect to apt.cache.travis-ci.com:80 (), connection timed out
                }
                else if (line.indexOf("Could not connect to ") != -1) {
                    errors.push({
                        failure_group: "Installation",
                        category: "connection",
                        type: "Unable to install dependencies",
                        logLine: lineNumber,
                    });
                    // error: component download failed for
                }
                else if (line.indexOf("error: component download failed for ") != -1) {
                    errors.push({
                        failure_group: "Installation",
                        category: "connection",
                        type: "Unable to install dependencies",
                        logLine: lineNumber,
                    });
                }
                else if (line.indexOf("Unable to connect to ") != -1) {
                    errors.push({
                        failure_group: "Installation",
                        category: "connection",
                        type: "Unable to install dependencies",
                        logLine: lineNumber,
                    });
                }
                else if (line.indexOf("Connection timed out") != -1) {
                    errors.push({
                        failure_group: "Installation",
                        category: "timeout",
                        type: "Connection timed out",
                        logLine: lineNumber,
                    });
                }
                else if (line.indexOf("The TLS connection was non-properly terminated.") != -1) {
                    errors.push({
                        failure_group: "Installation",
                        category: "connection",
                        type: "Connection terminated",
                        logLine: lineNumber,
                    });
                }
                else if (line.indexOf("The job exceeded the maximum time limit for jobs, and has been terminated.") != -1) {
                    errors.push({
                        failure_group: "Travis",
                        category: "travis",
                        type: "Execution timeout",
                        logLine: lineNumber,
                    });
                }
                else if (line.indexOf("No output has been received in the last 10m") != -1) {
                    errors.push({
                        failure_group: "Travis",
                        category: "travis",
                        type: "Log timeout",
                        logLine: lineNumber,
                    });
                }
                else if ((result = line.match(/Failed to download (file|index): (?<file>[^ ]+)/))) {
                    errors.push({
                        failure_group: "Installation",
                        category: "connection",
                        library: result.groups.file,
                        type: "Missing Library",
                        logLine: lineNumber,
                    });
                }
                else if ((result = line.match(/Unable to locate package (?<file>[^ ]+)/))) {
                    errors.push({
                        failure_group: "Installation",
                        category: "library",
                        type: "Missing Library",
                        library: result.groups.file,
                        logLine: lineNumber,
                    });
                }
                else if ((result = line.match(/error: failed to push some refs to '(?<file>[^']+)'/))) {
                    errors.push({
                        failure_group: "Installation",
                        category: "credential",
                        type: "Unable to push",
                        message: result.groups.file,
                        logLine: lineNumber,
                    });
                }
                else if (line.toLowerCase().indexOf("address already in use") > -1) {
                    errors.push({
                        failure_group: "Execution",
                        category: "execution",
                        type: "port already in use",
                        logLine: lineNumber,
                    });
                }
                for (var _a = 0, parsers_1 = parsers; _a < parsers_1.length; _a++) {
                    var parser = parsers_1[_a];
                    if (job.config && !parser.isSupportedLanguage(job.config.language)) {
                        continue;
                    }
                    try {
                        parser.parse(line, lineNumber);
                    }
                    catch (e) {
                        console.error(e, parser.name, lineNumber);
                    }
                }
            }
        }
        for (var _b = 0, parsers_2 = parsers; _b < parsers_2.length; _b++) {
            var parser = parsers_2[_b];
            Array.prototype.push.apply(tests, parser.tests);
            Array.prototype.push.apply(errors, parser.errors);
            if (parser.tool != null && tool == null) {
                tool = parser.tool;
            }
        }
        var reasons = errors.concat([]);
        for (var _c = 0, tests_1 = tests; _c < tests_1.length; _c++) {
            var test_1 = tests_1[_c];
            if (test_1.nbFailure > 0) {
                reasons.push({
                    failure_group: "Test",
                    category: "test",
                    message: test_1.name,
                    type: "Test failure",
                    logLine: test_1.logLine,
                });
            }
            if (test_1.nbError > 0) {
                reasons.push({
                    failure_group: "Test",
                    category: "test",
                    message: test_1.name,
                    type: "Test error",
                    logLine: test_1.logLine,
                });
            }
        }
        return {
            tests: tests,
            errors: errors,
            tool: tool,
            exitCode: exitCode,
            reasons: reasons,
            commit: commit,
        };
    }
    catch (e) {
        console.error(e);
    }
}
exports.default = parseLog;
