import * as esbuild from 'esbuild';
import { existsSync, mkdirSync } from 'fs';

const outDir = '.tmp/tests';
const entryPoint = 'tests/all.spec.ts';

mkdirSync(outDir, { recursive: true });

if (!existsSync(entryPoint)) {
  console.log('Entry point not found');
  process.exit(1);
}

try {
  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    format: 'iife',
    globalName: 'testsBundle',
    platform: 'browser',
    target: ['es2020'],
    outfile: '.tmp/tests/tests.bundle.js',
    sourcemap: true,
    loader: { '.ts': 'ts', '.tsx': 'tsx', '.css': 'css' },
    jsx: 'automatic',
    define: {
      'process.env.NODE_ENV': '"test"',
      'import.meta.env.VITE_API_URL': '"https://syncpass.test.invalid"',
      'import.meta.env.MODE': '"test"',
      'import.meta.env.DEV': 'false',
      'import.meta.env.PROD': 'false'
    }
  });
  console.log('Bundle created: .tmp/tests/tests.bundle.js');
} catch (e) {
  console.error('Build error');
  process.exit(1);
}
