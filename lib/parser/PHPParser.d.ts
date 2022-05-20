import Parser from "./Parser";
export default class PhpParser extends Parser {
    currentTest: any;
    constructor();
    parse(line: string, lineNumber: number): void;
}
