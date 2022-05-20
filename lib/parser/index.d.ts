import { ErrorType, TestType } from "./Parser";
export default function parseLog(log: string): {
    tests: TestType[];
    errors: ErrorType[];
    tool: string;
    exitCode: number;
    reasons: ErrorType[];
    commit: string;
};
