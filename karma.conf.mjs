
import fs from 'fs';
import path from 'path';

function findEdge() {
  const candidates = [
    process.env.EDGE_BIN,
    process.env.CHROME_BIN,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge Beta\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge Beta\\Application\\msedge.exe'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Buscar Edge en carpetas de versiones instaladas
  const base =
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\';

  if (fs.existsSync(base)) {
    const entries = fs.readdirSync(base);

    for (const entry of entries) {
      if (/^[0-9.]+$/.test(entry)) {
        const executable = path.join(base, entry, 'msedge.exe');

        if (fs.existsSync(executable)) {
          return executable;
        }
      }
    }
  }

  throw new Error(
    'Microsoft Edge no fue encontrado. Configura EDGE_BIN con la ruta de msedge.exe.'
  );
}

export default function (config) {
  // Detectar Microsoft Edge automáticamente
  const edgePath = findEdge();

  // Karma Chrome Launcher utiliza CHROME_BIN
  process.env.CHROME_BIN = edgePath;

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
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      }
    },

    singleRun: true,

    concurrency: Infinity,

    browserDisconnectTimeout: 10000,

    browserDisconnectTolerance: 3,

    browserNoActivityTimeout: 60000
  });
}
