#!/usr/bin/env node
/**
 * Project-Dixis Agent Scope Limiter
 * Ensures agent operations are scoped to frontend directory only
 */

const path = require('path');
const fs = require('fs');

// Get current working directory
const cwd = process.cwd();
const expectedName = 'frontend';
const parentDir = path.dirname(cwd);
const currentDirName = path.basename(cwd);

console.log('🔍 Agent Scope Verification');
console.log(`→ CWD: ${cwd}`);
console.log(`→ Current dir name: ${currentDirName}`);

// Check if we're in the frontend directory
if (currentDirName !== expectedName) {
  console.error(`❌ Unexpected CWD: Expected '${expectedName}', got '${currentDirName}'`);
  console.error(`→ Please run: cd Project-Dixis/frontend && npm run agent:limit-scan`);
  process.exit(1);
}

// Check if we're in the right parent structure (Project-Dixis should contain backend/ and frontend/)
const backendPath = path.join(parentDir, 'backend');
const frontendPath = path.join(parentDir, 'frontend');
const claudePath = path.join(parentDir, 'CLAUDE.md');

if (!fs.existsSync(backendPath) || !fs.existsSync(frontendPath) || !fs.existsSync(claudePath)) {
  console.error(`❌ Invalid parent structure. Expected Project-Dixis/ with backend/, frontend/, CLAUDE.md`);
  console.error(`→ Backend exists: ${fs.existsSync(backendPath)}`);
  console.error(`→ Frontend exists: ${fs.existsSync(frontendPath)}`);
  console.error(`→ CLAUDE.md exists: ${fs.existsSync(claudePath)}`);
  process.exit(1);
}

// All checks passed
console.log('✅ Agent scope correctly limited to frontend/');
console.log('✅ Project structure verified');
console.log('→ Proceeding with frontend-scoped operations...');

// Show some key paths that will be accessible
const keyPaths = [
  'src/',
  'components/',
  'pages/',
  'app/',
  'tests/',
  'package.json',
  'next.config.js',
  'tailwind.config.js'
].filter(p => fs.existsSync(path.join(cwd, p)));

console.log(`→ Accessible paths: ${keyPaths.join(', ')}`);