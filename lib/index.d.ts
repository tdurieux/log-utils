export declare const properties: RegExp[];
export declare const startWith: string[];
export declare const toRemove: RegExp[];
/**
 * Check if a string is empty or if it is a comment
 * @param str the string to test
 * @returns true if the file is empty
 */
export declare function isEmpty(str: string): boolean;
/**
 * Split a string into lines
 * @param str the string to split
 * @returns an array of lines
 */
export declare function lines(str: string): string[];
/**
 * Normalize the log file
 * @param log the log to normalize
 * @returns a normalized log
 */
export declare function normalizeLog(log: string): string;
/**
 * Clean a log file by removing useless lines
 *
 * @param input the log to clean
 * @returns a cleaned log
 */
export declare function cleanLog(input: string): string | null;
/**
 * Parses a log file and returns useful information such as test results or errors
 *
 * @param input the log to parse
 * @returns
 */
export declare function parseLog(input: string): {
    tests: import("./parser/Parser").TestType[];
    errors: import("./parser/Parser").ErrorType[];
    tool: string | null;
    exitCode: number | null;
    reasons: import("./parser/Parser").ErrorType[];
    commit: string | null;
};
