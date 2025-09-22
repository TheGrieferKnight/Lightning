/**
 * .gitignore validation tests
 *
 * Test framework compatibility:
 * - Jest: yes (describe/it globals; uses Node's assert/strict)
 * - Vitest: yes (describe/it globals; uses Node's assert/strict)
 * - Mocha: yes  (describe/it globals; uses Node's assert/strict)
 *
 * Focus: Validate critical .gitignore rules as per the PR diff.
 * These tests assert presence of key patterns, ordering for negations,
 * and basic hygiene (no trailing whitespace, no BOM).
 */

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const gitignorePath = path.resolve(process.cwd(), '.gitignore');
const exists = fs.existsSync(gitignorePath);
const content = exists ? fs.readFileSync(gitignorePath, 'utf8') : '';
const lines = content.split(/\r?\n/);
const trimmed = lines.map((l) => l.trim());

function hasLine(pattern) {
  return trimmed.includes(pattern);
}
function firstIndexOf(pattern) {
  return trimmed.indexOf(pattern);
}

describe('Repository .gitignore (critical rules)', function () {
  it('exists at repository root', function () {
    assert.ok(exists, 'Expected a .gitignore file at the repository root.');
  });

  it('contains expected section headers from the diff', function () {
    // Comments that delineate sections
    assert.ok(hasLine('# Logs'), 'Missing "# Logs" section header.');
    assert.ok(
      hasLine('# Editor directories and files'),
      'Missing "# Editor directories and files" section header.'
    );
  });

  it('includes log and debug patterns (happy path)', function () {
    const required = [
      'logs',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'pnpm-debug.log*',
      'lerna-debug.log*',
    ];
    const missing = required.filter((r) => !hasLine(r));
    assert.deepEqual(
      missing,
      [],
      `Missing log-related .gitignore rules: ${missing.join(', ')}`
    );
  });

  it('ignores heavy directories and build artifacts', function () {
    const required = [
      'node_modules',
      'apps/desktop/src-tauri/target',
      'packages/*/dist',
      'dist-ssr',
      '*.local',
    ];
    const missing = required.filter((r) => !hasLine(r));
    assert.deepEqual(
      missing,
      [],
      `Missing build/artifact .gitignore rules: ${missing.join(', ')}`
    );
  });

  it('ignores editor/OS-specific clutter and properly re-includes .vscode/extensions.json', function () {
    const required = [
      '.vscode/*',
      '!.vscode/extensions.json',
      '.idea',
      '.DS_Store',
      '*.suo',
      '*.ntvs*',
      '*.njsproj',
      '*.sln',
      '*.sw?',
    ];
    const missing = required.filter((r) => !hasLine(r));
    assert.deepEqual(
      missing,
      [],
      `Missing editor/OS .gitignore rules: ${missing.join(', ')}`
    );
  });

  it('places the .vscode negation after the blanket .vscode ignore (edge-case ordering)', function () {
    const idxIgnore = firstIndexOf('.vscode/*');
    const idxNegate = firstIndexOf('!.vscode/extensions.json');
    assert.ok(idxIgnore >= 0, 'Expected ".vscode/*" rule to exist.');
    assert.ok(idxNegate >= 0, 'Expected "!.vscode/extensions.json" rule to exist.');
    assert.ok(
      idxNegate > idxIgnore,
      `Expected "!.vscode/extensions.json" to come after ".vscode/*" (found at ${idxNegate} vs ${idxIgnore}).`
    );
  });

  it('does not start with a UTF-8 BOM (hygiene)', function () {
    if (!exists) this.skip?.(); // Skip if .gitignore missing
    assert.notStrictEqual(
      content[0],
      '\uFEFF',
      'The .gitignore file should not start with a BOM (\\uFEFF).'
    );
  });

  it('has no trailing whitespace on rule lines (hygiene)', function () {
    if (!exists) this.skip?.(); // Skip if .gitignore missing
    const offenders = lines
      .map((raw, i) => ({ raw, i: i + 1, t: raw.trim() }))
      .filter((o) => o.t !== '' && !o.t.startsWith('#') && /[ \t]+$/.test(o.raw));
    assert.strictEqual(
      offenders.length,
      0,
      `Trailing whitespace found on rule lines: ${offenders
        .map((o) => `${o.i}:${JSON.stringify(o.raw)}`)
        .join(', ')}`
    );
  });

  it('keeps section order: "# Logs" appears before "# Editor directories and files"', function () {
    const idxLogs = firstIndexOf('# Logs');
    const idxEditor = firstIndexOf('# Editor directories and files');
    assert.ok(idxLogs >= 0, 'Missing "# Logs" header.');
    assert.ok(idxEditor >= 0, 'Missing "# Editor directories and files" header.');
    assert.ok(
      idxLogs < idxEditor,
      `Expected "# Logs" to appear before "# Editor directories and files" (found at ${idxLogs} and ${idxEditor}).`
    );
  });
});