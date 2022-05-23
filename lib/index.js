"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLog = exports.cleanLog = exports.normalizeLog = exports.lines = exports.isEmpty = exports.toRemove = exports.startWith = exports.properties = void 0;
var ansi_regex_1 = require("ansi-regex");
var parser_1 = require("./parser");
exports.properties = [
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
exports.startWith = [
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
exports.toRemove = [
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
function isEmpty(str) {
    var trimmedLine = str.trim();
    return (trimmedLine.length == 0 ||
        trimmedLine == "" ||
        trimmedLine[1] == "%" ||
        trimmedLine[2] == "%");
}
exports.isEmpty = isEmpty;
function lines(str) {
    return str.split(/\r\n|(?!\r\n)[\n-\r\x85\u2028\u2029]/);
}
exports.lines = lines;
function normalizeLog(log) {
    var output = [];
    line: for (var _i = 0, _a = lines(log); _i < _a.length; _i++) {
        var line = _a[_i];
        line = line.trim();
        if (isEmpty(line)) {
            continue;
        }
        for (var _b = 0, properties_1 = exports.properties; _b < properties_1.length; _b++) {
            var property = properties_1[_b];
            line = line.replace(property, "$1");
        }
        for (var _c = 0, toRemove_1 = exports.toRemove; _c < toRemove_1.length; _c++) {
            var property = toRemove_1[_c];
            line = line.replace(property, "");
        }
        if (isEmpty(line)) {
            continue line;
        }
        output.push(line);
    }
    return output.join("\n");
}
exports.normalizeLog = normalizeLog;
function cleanLog(input) {
    if (input == null) {
        return null;
    }
    var log = input.replace((0, ansi_regex_1.default)(), "");
    if (log == null)
        return null;
    var output = [];
    for (var _i = 0, _a = lines(log); _i < _a.length; _i++) {
        var line = _a[_i];
        if (line.includes("\b")) {
            var cs = [];
            for (var i = 0; i < line.length; i++) {
                if (line[i] == "\b") {
                    // remove the previous character
                    cs.pop();
                }
                else {
                    cs.push(line[i]);
                }
            }
            line = cs.join("");
        }
        output.push(line);
    }
    return output.join("\n");
}
exports.cleanLog = cleanLog;
function parseLog(input) {
    return (0, parser_1.default)(input);
}
exports.parseLog = parseLog;
