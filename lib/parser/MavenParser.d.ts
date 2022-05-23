import Parser, { ErrorType, TestType } from "./Parser";
export default class MavenParser extends Parser {
    inCheckstyleReport: boolean;
    inCompilationErrorReport: boolean;
    inCompilationError: boolean;
    startingMaven: boolean;
    isAudit: boolean;
    inGradleError: boolean;
    currentError: Partial<ErrorType> | null;
    currentTest: Partial<TestType> | null;
    constructor();
    parse(line: string, lineNumber: number): void;
}
