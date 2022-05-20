import Parser from "./Parser";
export default class JavaParser extends Parser {
    inGroup: any;
    currentElement: any;
    constructor();
    parse(line: string, lineNumber: number): void;
}
