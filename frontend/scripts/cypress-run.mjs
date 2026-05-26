#!/usr/bin/env node
// Cross-platform launcher for `cypress run`.
// On Windows, prepends the PowerShell directory to PATH so that Cypress's
// internal browser detection (which spawns powershell.exe) works when called
// from Git Bash, where C:\Windows\System32\WindowsPowerShell\v1.0\ is not on
// PATH by default.
import { spawn } from 'node:child_process'
import process from 'node:process'

const env = { ...process.env }

if (process.platform === 'win32') {
  const psDir = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0'
  const sep = ';'
  const path = env.PATH || env.Path || ''
  if (!path.toLowerCase().includes('windowspowershell\\v1.0')) {
    env.PATH = path ? `${path}${sep}${psDir}` : psDir
  }
}

const child = spawn(
  'npx',
  [
    'cypress',
    'run',
    '--browser',
    'chrome',
    '--headless',
    ...process.argv.slice(2),
  ],
  { env, stdio: 'inherit', shell: true }
)

child.on('exit', (code) => process.exit(code ?? 0))
