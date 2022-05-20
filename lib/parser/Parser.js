"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Parser = /** @class */ (function () {
    function Parser(name, languages) {
        this.name = name;
        this.languages = languages;
        this.tests = [];
        this.errors = [];
        this.tool = null;
    }
    Parser.prototype.isSupportedLanguage = function (language) {
        if (this.languages.length == 0) {
            return true;
        }
        return this.languages.includes(language.toLowerCase());
    };
    return Parser;
}());
exports.default = Parser;
