export default class Parser {
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
//# sourceMappingURL=Parser.js.map