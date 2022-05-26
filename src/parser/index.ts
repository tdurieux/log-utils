import { isEmpty, startWith } from "../index.js";
import GenericParser from "./GenericParser.js";
import GoParser from "./GoParser.js";
import JsParser from "./JSParser.js";
import JavaParser from "./JavaParser.js";
import ObjcParser from "./ObjcParser.js";
import Parser, { ErrorType, TestType } from "./Parser.js";
import PhpParser from "./PHPParser.js";
import PyParser from "./PythonParser.js";
import RubyParser from "./RubyParser.js";

export default function parseLog(log: string) {
  if (log == null) throw new Error("log is not defined");
  const job: Partial<{
    config: {
      language: string;
    };
    id: string;
  }> = {};
  try {
    /**
     * @type {Parser[]}
     */
    const parsers: Parser[] = [
      new JavaParser(),
      //   new MavenParser(),
      new JsParser(),
      new PyParser(),
      new ObjcParser(),
      new PhpParser(),
      new RubyParser(),
      new GoParser(),
      new GenericParser(),
    ];

    let exitCode: number | null = null;

    let tool: string | null = null;
    const tests: TestType[] = [];
    const errors: ErrorType[] = [];
    let commit: string | null = null;

    let lineStart = 0;
    let lineNumber = 0;
    line: for (let i = 0; i < log.length; i++) {
      if (i == log.length - 1 || log[i] == "\n") {
        const line = log.slice(lineStart, i + 1).trim();
        let result = null;

        lineStart = i + 1;
        lineNumber++;

        if (isEmpty(line)) continue;

        for (let property of startWith) {
          if (line.indexOf(property) > -1) {
            continue line;
          }
        }

        if (
          (!job.config || !job.config.language) &&
          line.indexOf("Build language: ") == 0
        ) {
          if (!job.config) {
            job.config = {
              language: line.replace("Build language: ", ""),
            };
          }
        } else if (line.indexOf("$ git checkout -qf ") != -1) {
          commit = line.replace("$ git checkout -qf ", "");
        } else if (line.indexOf("git fetch origin ") != -1) {
          //console.log(line)
        } else if (line.indexOf("Done. Your build exited with ") != -1) {
          exitCode = parseInt(
            line.substring(
              "Done. Your build exited with ".length,
              line.length - 1
            )
          );
        } else if (
          line.indexOf("fatal: Could not read from remote repository.") != -1
        ) {
          errors.push({
            failure_group: "Installation",
            type: "Unable to clone",
            logLine: lineNumber,
          });
        } else if (
          (result = line.match(/fatal: unable to access '(?<repo>[^']+)'/))
        ) {
          errors.push({
            failure_group: "Installation",
            category: "credential",
            type: "Unable to clone",
            message: result.groups?.file,
            logLine: lineNumber,
          });
        } else if (
          (result = line.match(
            /fatal: Authentication failed for '(?<file>[^']+)'/
          ))
        ) {
          errors.push({
            failure_group: "Installation",
            category: "credential",
            type: "Unable to clone",
            message: result.groups?.file,
            logLine: lineNumber,
          });
        } else if (line.indexOf("Error: retrieving gpg key timed out.") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "timeout",
            type: "[gpg] Unable to install dependencies",
            logLine: lineNumber,
          });
        } else if (line.indexOf("Hash Sum mismatch") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Incorrect hash sum",
            logLine: lineNumber,
          });
          // Could not connect to apt.cache.travis-ci.com:80 (), connection timed out
        } else if (line.indexOf("Could not connect to ") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Unable to install dependencies",
            logLine: lineNumber,
          });
          // error: component download failed for
        } else if (
          line.indexOf("error: component download failed for ") != -1
        ) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Unable to install dependencies",
            logLine: lineNumber,
          });
        } else if (line.indexOf("Unable to connect to ") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Unable to install dependencies",
            logLine: lineNumber,
          });
        } else if (line.indexOf("Connection timed out") != -1) {
          errors.push({
            failure_group: "Installation",
            category: "timeout",
            type: "Connection timed out",
            logLine: lineNumber,
          });
        } else if (
          line.indexOf("The TLS connection was non-properly terminated.") != -1
        ) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            type: "Connection terminated",
            logLine: lineNumber,
          });
        } else if (
          line.indexOf(
            "The job exceeded the maximum time limit for jobs, and has been terminated."
          ) != -1
        ) {
          errors.push({
            failure_group: "Travis",
            category: "travis",
            type: "Execution timeout",
            logLine: lineNumber,
          });
        } else if (
          line.indexOf("No output has been received in the last 10m") != -1
        ) {
          errors.push({
            failure_group: "Travis",
            category: "travis",
            type: "Log timeout",
            logLine: lineNumber,
          });
        } else if (
          (result = line.match(
            /Failed to download (file|index): (?<file>[^ ]+)/
          ))
        ) {
          errors.push({
            failure_group: "Installation",
            category: "connection",
            library: result.groups?.file,
            type: "Missing Library",
            logLine: lineNumber,
          });
        } else if (
          (result = line.match(/Unable to locate package (?<file>[^ ]+)/))
        ) {
          errors.push({
            failure_group: "Installation",
            category: "library",
            type: "Missing Library",
            library: result.groups?.file,
            logLine: lineNumber,
          });
        } else if (
          (result = line.match(
            /error: failed to push some refs to '(?<file>[^']+)'/
          ))
        ) {
          errors.push({
            failure_group: "Installation",
            category: "credential",
            type: "Unable to push",
            message: result.groups?.file,
            logLine: lineNumber,
          });
        } else if (line.toLowerCase().indexOf("address already in use") > -1) {
          errors.push({
            failure_group: "Execution",
            category: "execution",
            type: "port already in use",
            logLine: lineNumber,
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
          logLine: test.logLine,
        });
      }
      if (test.nbError > 0) {
        reasons.push({
          failure_group: "Test",
          category: "test",
          message: test.name,
          type: "Test error",
          logLine: test.logLine,
        });
      }
    }
    return {
      tests: tests,
      errors: errors,
      tool: tool,
      exitCode,
      reasons,
      commit,
    };
  } catch (e) {
    throw new Error(`Unable to parse log file: ${e}`);
  }
}
