// Testing library/framework: Node.js built-in test runner (node:test) + assert/strict
// Scope: Validate root package.json (scripts, workspaces, deps) as per PR diff.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');

assert.ok(fs.existsSync(pkgPath), 'package.json must exist at repository root');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function expectFile(rel) {
  const abs = path.join(root, rel);
  assert.ok(fs.existsSync(abs), `Missing file: ${rel}`);
  assert.ok(fs.statSync(abs).isFile(), `Expected a file at: ${rel}`);
}
function expectDir(rel) {
  const abs = path.join(root, rel);
  assert.ok(fs.existsSync(abs), `Missing directory: ${rel}`);
  assert.ok(fs.statSync(abs).isDirectory(), `Expected a directory at: ${rel}`);
}

describe('package.json: metadata', () => {
  test('basic fields', () => {
    assert.equal(pkg.name, 'lightning');
    assert.equal(pkg.private, true);
    assert.equal(pkg.version, '1.0.1');
    assert.equal(pkg.type, 'module');
  });

  test('workspaces globs', () => {
    assert.deepEqual(pkg.workspaces, ['apps/*', 'packages/*', 'services/*']);
  });
});

describe('package.json: scripts', () => {
  const expectedScripts = {
    'dev:desktop': 'vite -c ./apps/desktop/vite.config.ts',
    'dev:web': 'vite -c ./apps/web/vite.config.ts',
    'build:web': 'tsc -b packages/pages packages/client packages/types packages/utils packages/ui packages/mock apps/web && tsc -p ./apps/web/tsconfig.json && vite build -c ./apps/web/vite.config.ts',
    'build:desktop': 'vite build -c ./apps/desktop/vite.config.ts',
    'typecheck': 'tsc -b packages/pages packages/client packages/types packages/utils packages/ui packages/mock apps/web && tsc -p ./apps/web/tsconfig.json',
    'preview': 'vite preview',
    'tauri': 'tauri'
  };

  test('presence and exact command strings', () => {
    assert.ok(pkg.scripts && typeof pkg.scripts === 'object', 'scripts must be defined');
    for (const [k, v] of Object.entries(expectedScripts)) {
      assert.ok(k in pkg.scripts, `script "${k}" is missing`);
      assert.equal(pkg.scripts[k], v, `script "${k}" must match expected command`);
    }
  });

  test('referenced files/dirs exist', () => {
    // Files referenced in scripts
    expectFile('apps/desktop/vite.config.ts');
    expectFile('apps/web/vite.config.ts');
    expectFile('apps/web/tsconfig.json');

    // Build/typecheck workspace directories
    [
      'packages/pages',
      'packages/client',
      'packages/types',
      'packages/utils',
      'packages/ui',
      'packages/mock',
      'apps/web'
    ].forEach(expectDir);
  });

  test('tauri CLI available when tauri script exists', () => {
    if ('tauri' in pkg.scripts) {
      assert.ok(pkg.devDependencies?.['@tauri-apps/cli'], 'Expected @tauri-apps/cli in devDependencies');
    }
  });
});

describe('package.json: dependencies', () => {
  const expectedDeps = {
    '@tailwindcss/vite': '^4.1.13',
    '@tanstack/react-query': '^5.89.0',
    '@tanstack/react-query-devtools': '^5.89.0',
    '@tanstack/react-query-persist-client': '^5.89.0',
    '@tauri-apps/api': '^2.8.0',
    '@tauri-apps/plugin-opener': '^2.5.0',
    '@tauri-apps/plugin-sql': '^2.3.0',
    '@types/node': '^24.3.1',
    'babel-plugin-react-compiler': '19.1.0-rc.3',
    'idb-keyval': '^6.2.2',
    'lucide-react': '^0.542.0',
    'react': '19.2.0-canary-fa3feba6-20250623',
    'react-dom': '19.2.0-canary-fa3feba6-20250623',
    'react-router-dom': '^7.8.1',
    'tailwindcss': '^4.1.12'
  };

  test('presence with exact versions', () => {
    assert.ok(pkg.dependencies && typeof pkg.dependencies === 'object', 'dependencies must be defined');
    for (const [dep, ver] of Object.entries(expectedDeps)) {
      assert.ok(dep in pkg.dependencies, `dependency "${dep}" is missing`);
      assert.equal(pkg.dependencies[dep], ver, `dependency "${dep}" version mismatch`);
    }
  });

  test('react and react-dom versions aligned', () => {
    assert.equal(pkg.dependencies['react'], pkg.dependencies['react-dom'], 'react and react-dom versions must match');
  });
});

describe('package.json: devDependencies', () => {
  const expectedDevDeps = {
    '@eslint/js': '^9.35.0',
    '@tauri-apps/cli': '^2.8.4',
    '@types/react': '^19.1.12',
    '@types/react-dom': '^19.1.9',
    '@typescript-eslint/eslint-plugin': '^8.40.0',
    '@typescript-eslint/parser': '^8.40.0',
    '@vitejs/plugin-react': '^5.0.2',
    'depcheck': '^1.4.7',
    'eslint': '^9.35.0',
    'eslint-config-xo': '^0.49.0',
    'eslint-plugin-react': '^7.37.5',
    'eslint-plugin-react-hooks': '^5.2.0',
    'globals': '^16.3.0',
    'jiti': '^2.5.1',
    'typescript': '~5.9.2',
    'typescript-eslint': '^8.42.0',
    'vite': '^7.1.4',
    'vite-tsconfig-paths': '^5.1.4'
  };

  test('presence with exact versions', () => {
    assert.ok(pkg.devDependencies && typeof pkg.devDependencies === 'object', 'devDependencies must be defined');
    for (const [dep, ver] of Object.entries(expectedDevDeps)) {
      assert.ok(dep in pkg.devDependencies, `devDependency "${dep}" is missing`);
      assert.equal(pkg.devDependencies[dep], ver, `devDependency "${dep}" version mismatch`);
    }
  });
});