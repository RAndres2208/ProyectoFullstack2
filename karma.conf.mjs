import fs from 'fs';
import path from 'path';

function findEdge() {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.EDGE_BIN,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge Beta\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge Beta\\Application\\msedge.exe'
  ].filter(Boolean);
  
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  
  // Try to find any version folder
  const base = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\';
  if (fs.existsSync(base)) {
    const entries = fs.readdirSync(base);
    for (const e of entries) {
      if (e.match(/^[0-9.]+$/)) {
        const p = path.join(base, e, 'msedge.exe');
        if (fs.existsSync(p)) return p;
      }
    }
    const p2 = path.join(base, 'msedge.exe');
    if (fs.existsSync(p2)) return p2;
  }
  
  return 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
}

export default function (config) {
  const edgePath = findEdge();
  
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
      'node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
      '.tmp/tests/tests.bundle.js'
    ],
    preprocessors: {},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN,
    autoWatch: false,
    browsers: ['EdgeHeadlessNoSandbox'],
    customLaunchers: {
      EdgeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        executablePath: edgePath
      }
    },
    singleRun: true,
    concurrency: Infinity,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000
  });
};
