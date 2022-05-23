import Parser, { TestType } from "./Parser";
export default class PyParser extends Parser {
    currentTest: TestType | null;
    totalTime: number;
    inPyflakes: boolean;
    constructor();
    parse(line: string, lineNumber: number): void;
}
