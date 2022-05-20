import Parser from "./Parser";
export default class JsParser extends Parser {
    startingMocha: boolean;
    totalTime: number;
    constructor();
    parse(line: string, lineNumber: number): void;
}
