import Parser from "./Parser";
export default class PyParser extends Parser {
    currentTest: any;
    totalTime: number;
    inPyflakes: boolean;
    constructor();
    parse(line: string, lineNumber: number): void;
}
