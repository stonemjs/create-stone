#!/usr/bin/env node
import spawn from 'cross-spawn'
import { argv } from 'node:process'

// Automatically invoke `stone init`
const process = spawn('stone', ['init', ...argv.slice(2)], { stdio: 'inherit' });

// Forward the exit code
process.on('close', (code) => {
  process.exit(code);
});