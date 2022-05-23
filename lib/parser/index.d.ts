import { ErrorType, TestType } from "./Parser";
export default function parseLog(log: string): {
    tests: TestType[];
    errors: ErrorType[];
    tool: string | null;
    exitCode: number | null;
    reasons: ErrorType[];
    commit: string | null;
} | null | undefined;
