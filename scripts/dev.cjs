const { spawn } = require('node:child_process');

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const pnpmCommand = isWindows ? 'pnpm.cmd' : 'pnpm';
const spawnOptions = {
  stdio: 'inherit',
  // Node 24 requiere un shell para lanzar wrappers .cmd en Windows.
  shell: isWindows,
};
const children = [
  spawn(npmCommand, ['--prefix', 'backend', 'run', 'dev'], spawnOptions),
  spawn(pnpmCommand, ['exec', 'vite'], spawnOptions),
];

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(exitCode);
}

for (const child of children) {
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping && code) stop(code);
  });
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
