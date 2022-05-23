export interface GenericError {
  failure_group: string;
  logLine: number;
  category?: string;
  type?: string;
  message?: string;
  parameter?: string;
  actual?: string;
  expected?: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface MissingLibraryError extends GenericError {
  type: "Missing Library";
  failure_group: "Installation";
  library: string;
  requiredBy?: string;
  version?: string;
}
export interface MissingMavenLibraryError extends GenericError {
  type: "Missing Maven Library";
  failure_group: "Installation";
  group_id: string;
  artifact: string;
  version: string;
}
export interface MissingLicenseError extends GenericError {
  type: "Missing License";
  failure_group: "License";
  file: string;
}

/**
 * The type of error extracted from the log
 */
export type ErrorType =
  | GenericError
  | MissingMavenLibraryError
  | MissingLicenseError
  | MissingLibraryError;

/**
 * Test information extracted from the logs
 */
export interface TestType {
  failure_group: string;
  logLine: number;
  name: string;
  body: string;
  nbTest: number;
  nbFailure: number;
  nbWarning?: number;
  nbError: number;
  nbSkipped: number;
  nbAssertion?: number;
  nbIncomplete?: number;
  time?: number;
}
export default abstract class Parser {
  tests: TestType[] = [];
  errors: ErrorType[] = [];
  tool: string | null = null;

  constructor(readonly name: string, readonly languages: string[]) {}

  isSupportedLanguage(language: string): boolean {
    if (this.languages.length == 0) {
      return true;
    }
    return this.languages.includes(language.toLowerCase());
  }

  abstract parse(line: string, lineNumber: number): void;
}
