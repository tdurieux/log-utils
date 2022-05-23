import Parser from "./Parser";
export default class JavaParser extends Parser {
    inGroup: string | null;
    currentElement: any | null;
    constructor();
    parse(line: string, lineNumber: number): void;
}
