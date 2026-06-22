import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = await readFile(new URL("../lib/sentiment.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});

const moduleContext = { exports: {} };
vm.runInNewContext(compiled.outputText, {
  module: moduleContext,
  exports: moduleContext.exports,
  require,
});

const { clampConfidence, parseSentiment } = moduleContext.exports;

test("parseSentiment accepts allowed values and normalizes case", () => {
  assert.equal(parseSentiment("POSITIVO"), "POSITIVO");
  assert.equal(parseSentiment("neutro"), "NEUTRO");
  assert.equal(parseSentiment(" negativo "), "NEGATIVO");
});

test("parseSentiment falls back to neutral for unknown or missing values", () => {
  assert.equal(parseSentiment("feliz"), "NEUTRO");
  assert.equal(parseSentiment(null), "NEUTRO");
  assert.equal(parseSentiment(undefined), "NEUTRO");
});

test("clampConfidence keeps sentiment confidence between zero and one", () => {
  assert.equal(clampConfidence(0.8), 0.8);
  assert.equal(clampConfidence(-1), 0);
  assert.equal(clampConfidence(2), 1);
  assert.equal(clampConfidence("invalid"), 0);
});
