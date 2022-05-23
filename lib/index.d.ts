export declare const properties: RegExp[];
export declare const startWith: string[];
export declare const toRemove: RegExp[];
export declare function isEmpty(str: string): boolean;
export declare function lines(str: string): string[];
export declare function normalizeLog(log: string): string;
export declare function cleanLog(input: string): string | null;
export declare function parseLog(input: string): {
    tests: import("./parser/Parser").TestType[];
    errors: import("./parser/Parser").ErrorType[];
    tool: string | null;
    exitCode: number | null;
    reasons: import("./parser/Parser").ErrorType[];
    commit: string | null;
} | null | undefined;
