import ansiRegex from "ansi-regex";
import parser from "./parser";

export const properties = [
  /(hostname:).*/g,
  /(version:).*/g,
  /(instance:).*/g,
  /(startup:).*/g,
  /(travis-build version:).*/g,
  /(process ).*/g,
  // /(Get|Ign|Hit):\d+/g,
  // /(Err:)\d+/g,
  /(container|Running in|--->) [0-9a-f]+/g,
  /(\/tmp\/tmp\.)[^ ]+/g,
  /(socket )[^ ]+/g,
];
export const startWith = [
  "Get",
  "Ign",
  "Hit",
  "Receiving objects:",
  "Resolving deltas:",
  "Unpacking objects:",
  "Reading package lists...",
  "Fetched",
  "Updating files:",
  "This take some time...",
  "travis_time:",
  "travis_fold",
  "remote:",
  "/home/travis/",
  "...",
  "###",
  "Progress",
];
export const toRemove = [
  // date
  // /.{3}, +(\d{1,2}) +.{3} (\d{1,4}) (\d{1,2}):(\d{1,2}):(\d{1,2}) +\+(\d{1,2})/g,
  // /.{3}, +(\d{1,2}):(\d{1,2}):(\d{1,2}) \+(\d+)/g,
  // /(\d+)\.(\d+):(\d+):(\d+)\.(\d+)/g,
  // /(\d+)-(\d+)-(\d+) (\d{1,2}):(\d{1,2}):(\d+)/g,
  // /(\d+)\/(\d{1,2})\/(\d+) (\d{1,2}):(\d{1,2}):(\d+) (PM|AM|pm|am)/g,
  // /(\d{1,2}):(\d{1,2}):(\d{1,2})/g,
  /(\d{1,4})(-|\/| )(\d{1,2})(-|\/| )(\d{1,4})( |T)?/g,
  /(\d{1,2}):(\d{1,2}):(\d{1,2})((\.|\+|,)(\d{1,4}))?( (PM|AM|pm|am))?( [A-Z]{3})?/g,
  // /\d{1,2}:\d{1,2}:\d{1,2}( [A-Z]{3})?/g,
  // Wed Oct 09 01:10:19 UTC 2019
  /.{3},?( .{3})? +(\d{1,2})( +.{3})?( |,)+(\d{1,4})/g,
  // travis stuffs
  /\((\d+)\/(\d+)\)/g,
  // java object id
  /(\@|\$\$)[0-9a-z]+(\:|{|,|]| )/g,
  // ids
  /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/,
  /(\d{5,})/g,
  /([0-9a-f]{10,})/g,
  // time
  /\d+:\d+ min/gi,
  /(-->) +(\d+)%/g,
  /([\d\.]+)m?s/gi,
  /([0-9\.]+)M=0s/gi,
  /([0-9\,\.]+) ?(kb|mb|m|b)(\/s)?/gi,
  /([0-9\.]+) (seconds|secs|s|sec)/g,
  /(▉|█|▋)+/g,
  /={3,}>? */g,
  /(\[|\|)\d+\/\d+(\]||\|)/g,
  // ip
  /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g,
  /\d{1,2} ?%/g,
];

/**
 * Check if a string is empty or if it is a comment
 * @param str the string to test
 * @returns true if the file is empty
 */
export function isEmpty(str: string) {
  const trimmedLine = str.trim();
  return (
    trimmedLine.length == 0 ||
    trimmedLine == "" ||
    trimmedLine[1] == "%" ||
    trimmedLine[2] == "%"
  );
}

/**
 * Split a string into lines
 * @param str the string to split
 * @returns an array of lines
 */
export function lines(str: string): string[] {
  return str.split(/\r\n|(?!\r\n)[\n-\r\x85\u2028\u2029]/);
}

/**
 * Normalize the log file
 * @param log the log to normalize
 * @returns a normalized log
 */
export function normalizeLog(log: string) {
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
    output.push(line);
  }
  return output.join("\n");
}

/**
 * Clean a log file by removing useless lines
 *
 * @param input the log to clean
 * @returns a cleaned log
 */
export function cleanLog(input: string) {
  if (input == null) {
    return null;
  }
  const log = input.replace(ansiRegex(), "");
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
    output.push(line);
  }
  return output.join("\n");
}

/**
 * Parses a log file and returns useful information such as test results or errors
 *
 * @param input the log to parse
 * @returns
 */
export function parseLog(input: string) {
  return parser(input);
}
