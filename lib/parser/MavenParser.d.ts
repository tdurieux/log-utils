import Parser from "./Parser";
export default class MavenParser extends Parser {
    inCheckstyleReport: boolean;
    inCompilationErrorReport: boolean;
    inCompilationError: boolean;
    startingMaven: boolean;
    isAudit: boolean;
    inGradleError: boolean;
    currentError: any;
    currentTest: any;
    constructor();
    parse(line: string, lineNumber: number): void;
}
