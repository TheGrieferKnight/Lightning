/**
 * Tests for jest.config.js
 * Testing library/framework: Jest
 *
 * Goals:
 * - Load the config (CJS or ESM) safely
 * - Validate structure and common options
 * - Be resilient if optional packages (jest-validate/jest-config) are unavailable
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const candidateFiles = [
  'jest.config.js',   // primary target per PR
  'jest.config.cjs',
  'jest.config.mjs',
];

let loadedPath = null;
let jestConfig = null;

async function loadConfig() {
  // Resolve a candidate path that exists
  for (const rel of candidateFiles) {
    const p = path.resolve(__dirname, rel);
    if (fs.existsSync(p)) {
      loadedPath = p;
      break;
    }
  }

  if (!loadedPath) {
    return { found: false, reason: 'No jest.config.* file found near repository root.' };
  }

  // Try require first (CJS). Fall back to dynamic import (ESM).
  try {
    delete require.cache[loadedPath];
    // eslint-disable-next-line import/no-dynamic-require, global-require
    jestConfig = require(loadedPath);
    return { found: true };
  } catch (requireErr) {
    try {
      const mod = await import(pathToFileURL(loadedPath).href);
      jestConfig = mod?.default ?? mod;
      return { found: true };
    } catch (importErr) {
      return { found: false, reason: `Failed to load config: ${requireErr.message} | ${importErr.message}` };
    }
  }
}

describe('jest.config.js', () => {
  let loadStatus;

  beforeAll(async () => {
    loadStatus = await loadConfig();
  });

  test('config file should exist and be loadable', () => {
    if (!loadStatus.found) {
      throw new Error(loadStatus.reason || 'Could not load jest config.');
    }
    expect(jestConfig).toBeDefined();
    expect(typeof jestConfig).toBe('object');
    expect(jestConfig).not.toBeNull();
    expect(Object.keys(jestConfig).length).toBeGreaterThan(0);
  });

  describe('core structure', () => {
    test('common fields (optional) have correct types', () => {
      if (!jestConfig) return;

      if ('testEnvironment' in jestConfig) {
        expect(typeof jestConfig.testEnvironment).toBe('string');
      }
      if ('roots' in jestConfig) {
        expect(Array.isArray(jestConfig.roots)).toBe(true);
        jestConfig.roots.forEach(r => expect(typeof r).toBe('string'));
      }
      if ('moduleFileExtensions' in jestConfig) {
        expect(Array.isArray(jestConfig.moduleFileExtensions)).toBe(true);
        jestConfig.moduleFileExtensions.forEach(ext => expect(typeof ext).toBe('string'));
      }
      if ('testMatch' in jestConfig) {
        expect(Array.isArray(jestConfig.testMatch)).toBe(true);
        jestConfig.testMatch.forEach(p => expect(typeof p).toBe('string'));
      }
      if ('testRegex' in jestConfig) {
        const tr = jestConfig.testRegex;
        const ok = typeof tr === 'string' || tr instanceof RegExp || Array.isArray(tr);
        expect(ok).toBe(true);
      }
      if ('transform' in jestConfig) {
        expect(typeof jestConfig.transform).toBe('object');
      }
      if ('coverageReporters' in jestConfig) {
        expect(Array.isArray(jestConfig.coverageReporters)).toBe(true);
      }
      if ('coverageThreshold' in jestConfig) {
        expect(typeof jestConfig.coverageThreshold).toBe('object');
        const g = jestConfig.coverageThreshold.global || {};
        Object.keys(g).forEach(k => {
          const v = g[k];
          if (typeof v !== 'undefined') {
            expect(typeof v).toBe('number');
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThanOrEqual(100);
          }
        });
      }
      if ('setupFiles' in jestConfig) {
        expect(Array.isArray(jestConfig.setupFiles)).toBe(true);
      }
      if ('setupFilesAfterEnv' in jestConfig) {
        expect(Array.isArray(jestConfig.setupFilesAfterEnv)).toBe(true);
      }
      if ('reporters' in jestConfig) {
        expect(Array.isArray(jestConfig.reporters)).toBe(true);
      }
    });

    test('does not enforce both testMatch and testRegex, but warns if both set', () => {
      if (!jestConfig) return;
      if (jestConfig.testMatch && jestConfig.testRegex) {
        // Allowed by Jest (testMatch takes precedence). Just warn.
        // eslint-disable-next-line no-console
        console.warn('Both testMatch and testRegex are defined; Jest will prefer testMatch.');
      }
      expect(true).toBe(true);
    });
  });

  describe('performance and ergonomics (optional)', () => {
    test('timeouts and workers are sane if present', () => {
      if (!jestConfig) return;
      if ('testTimeout' in jestConfig) {
        expect(typeof jestConfig.testTimeout).toBe('number');
        expect(jestConfig.testTimeout).toBeGreaterThan(0);
      }
      if ('maxWorkers' in jestConfig) {
        const t = jestConfig.maxWorkers;
        const ok = typeof t === 'number' || (typeof t === 'string' && /^\d+%?$|^max$/.test(t));
        expect(ok).toBe(true);
      }
    });
  });

  describe('optional validation with jest-validate (if available)', () => {
    test('validates against Jest defaults when jest-validate is present', () => {
      if (!jestConfig) return;
      let validate, defaults;

      try {
        ({ validate } = require('jest-validate'));
        ({ defaults } = require('jest-config'));
      } catch (_) {
        // Packages not available; skip validation silently.
        return;
      }
      const result = validate(jestConfig, {
        exampleConfig: defaults,
        comment: 'Jest Configuration Validation',
      });
      expect(result.hasDeprecationWarnings).toBeFalsy();
    });
  });

  describe('integration sanity', () => {
    test('Jest itself can run expectations', () => {
      expect(1 + 1).toBe(2);
      expect(expect.extend).toBeDefined();
    });
  });
});