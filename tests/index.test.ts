import * as logUtils from "../src/index";

describe("testing isEmpty", () => {
  test("empty string should be empty", () => {
    expect(logUtils.isEmpty("")).toBe(true);
  });
  test("space string should be empty", () => {
    expect(logUtils.isEmpty("  ")).toBe(true);
  });
});

describe("testing normalizeLog", () => {
  test("empty string should be empty", () => {
    expect(logUtils.normalizeLog("")).toBe("");
  });
  test("empty lines should be empty", () => {
    expect(logUtils.normalizeLog("  ")).toBe("");
  });
});

describe("testing cleanLog", () => {
  test("\b character", () => {
    expect(logUtils.cleanLog("test\b\b")).toBe("te");
  });
});

describe("testing parseLog", () => {
  test("Generic parser", () => {
    expect(logUtils.parseLog("Unable to locate package test")).toEqual({
      commit: null,
      errors: [
        {
          failure_group: "Installation",
          category: "library",
          type: "Missing Library",
          library: "test",
          logLine: 1,
        },
      ],
      exitCode: null,
      reasons: [
        {
          failure_group: "Installation",
          category: "library",
          type: "Missing Library",
          library: "test",
          logLine: 1,
        },
      ],
      tests: [],
      tool: null,
    });
    expect(
      logUtils.parseLog(
        '[error] org.xmlaxAXParseException; lineNumber: 6; columnNumber: 3; The element type "hr" must be terminated by the matching end-tag "".'
      )
    ).toEqual({
      commit: null,
      errors: [
        {
          failure_group: "Execution",
          logLine: 1,
          message:
            'The element type "hr" must be terminated by the matching end-tag "".',
          type: "generic",
          line: 6,
          column: 3,
        },
      ],
      exitCode: null,
      reasons: [
        {
          failure_group: "Execution",
          logLine: 1,
          message:
            'The element type "hr" must be terminated by the matching end-tag "".',
          type: "generic",
          line: 6,
          column: 3,
        },
      ],
      tests: [],
      tool: null,
    });
  });

  test("Java parser", () => {
    expect(
      logUtils.parseLog(
        "Build language: java\n3 tests completed, 0 failed, 0 skipped"
      )
    ).toEqual({
      commit: null,
      errors: [],
      exitCode: null,
      reasons: [],
      tests: [
        {
          failed: 0,
          logLine: 2,
          nbTest: 3,
          skipped: 0,
        },
      ],
      tool: null,
    });
  });

  test("Java group parser", () => {
    expect(
      logUtils.parseLog(
        "Build language: java\nRunning MyTests.MyTest\ncontent\nTests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1 s"
      )
    ).toEqual({
      commit: null,
      errors: [],
      exitCode: null,
      reasons: [],
      tests: [
        {
          name: "MyTests.MyTest",
          class: undefined,
          body: "content\n",
          nbTest: 3,
          nbFailure: 0,
          nbError: 0,
          nbSkipped: 0,
          time: 1,
        },
      ],
      tool: null,
    });
  });

  test("JS parser", () => {
    expect(
      logUtils.parseLog(
        "Build language: node\nSpec Files:	 5 passed, 2 failed, 7 total (1 completed)"
      )
    ).toEqual({
      commit: null,
      errors: [],
      exitCode: null,
      reasons: [
        {
          category: "test",
          failure_group: "Test",
          logLine: 2,
          type: "Test failure",
          message: "",
        },
      ],
      tests: [
        {
          failure_group: "Test",
          logLine: 2,
          body: "",
          nbTest: 7,
          nbFailure: 2,
          name: "",
          nbError: 0,
          nbSkipped: 0,
        },
      ],
      tool: null,
    });
  });
});
