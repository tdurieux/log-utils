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
});
