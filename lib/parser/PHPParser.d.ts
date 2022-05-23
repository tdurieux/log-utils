import Parser, { TestType } from "./Parser";
export default class PhpParser extends Parser {
    currentTest: TestType | null;
    constructor();
    parse(line: string, lineNumber: number): void;
}
