// @ts-check
const { danger, warn, message, markdown } = require('danger')

/**
 * TOOLS-03: DangerJS Gatekeeper - Soft Mode
 * 
 * Provides gentle warnings for PR quality without blocking merges.
 * Focus areas: LOC, artifacts, workflow changes, port/version compliance
 */

const { pr, git } = danger

// 🎯 Rule 1: Large PR Warning (LOC > 300)
const changedFiles = git.created_files.concat(git.modified_files)
const lineCount = git.lines_of_code

if (lineCount > 300) {
  warn(`📏 **Large PR Detected**: ${lineCount} lines of code changed. Consider breaking this into smaller PRs for easier review.`)
}

// 🎯 Rule 2: Workflow Changes Alert
const workflowChanges = changedFiles.filter(file => 
  file.includes('.github/workflows/') || 
  file.includes('.github/actions/')
)

if (workflowChanges.length > 0) {
  warn(`⚙️ **CI/CD Changes Detected**: Modified workflow files: ${workflowChanges.join(', ')}. Please verify CI behavior carefully.`)
}

// 🎯 Rule 3: Critical Configuration Monitoring
const configFiles = changedFiles.filter(file => 
  file.includes('package.json') ||
  file.includes('package-lock.json') ||
  file.includes('composer.json') ||
  file.includes('composer.lock') ||
  file.includes('.env.example') ||
  file.includes('next.config.js') ||
  file.includes('playwright.config.ts')
)

if (configFiles.length > 0) {
  warn(`🔧 **Configuration Changes**: Modified config files: ${configFiles.join(', ')}. Verify compatibility and version constraints.`)
}

// 🎯 Rule 4: File Pattern Compliance (Simplified)
const jsFiles = changedFiles.filter(file => file.endsWith('.js') || file.endsWith('.ts'))
const ymlFiles = changedFiles.filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))

if (jsFiles.length > 0) {
  message(`📝 **JS/TS Files Modified**: ${jsFiles.length} files. Consider port compliance (8001/3001) and version checks.`)
}

if (ymlFiles.length > 0) {
  warn(`⚙️ **YAML Files Modified**: ${ymlFiles.join(', ')}. Verify workflow syntax and service configurations.`)
}

// 🎯 Rule 5: Missing Test/Artifact Files
const hasBackendChanges = changedFiles.some(file => file.startsWith('backend/'))
const hasFrontendChanges = changedFiles.some(file => file.startsWith('frontend/'))
const hasTestFiles = changedFiles.some(file => file.includes('test') || file.includes('spec'))
const hasE2EFiles = changedFiles.some(file => file.includes('e2e') || file.includes('playwright'))

if ((hasBackendChanges || hasFrontendChanges) && !hasTestFiles && !hasE2EFiles) {
  warn(`🧪 **Test Coverage**: Consider adding tests for your changes. Backend/Frontend changes detected but no test files modified.`)
}

// 🎯 Rule 6: Documentation Reminder
const hasDocChanges = changedFiles.some(file => 
  file.includes('README') || 
  file.includes('CLAUDE.md') ||
  file.includes('.md')
)

if ((hasBackendChanges || hasFrontendChanges) && !hasDocChanges) {
  message(`📚 **Documentation**: Consider updating documentation for significant changes.`)
}

// 🎯 Summary Statistics
const stats = {
  'Files Changed': changedFiles.length,
  'Lines of Code': lineCount,
  'Backend Changes': hasBackendChanges ? '✅' : '❌',
  'Frontend Changes': hasFrontendChanges ? '✅' : '❌',  
  'Test Changes': hasTestFiles || hasE2EFiles ? '✅' : '❌',
  'Documentation': hasDocChanges ? '✅' : '❌'
}

markdown(`
## 🎯 TOOLS-03 Gatekeeper Summary

${Object.entries(stats).map(([key, value]) => `**${key}**: ${value}`).join('\n')}

---
*Soft mode enabled - All checks are advisory only* 🟡
`)