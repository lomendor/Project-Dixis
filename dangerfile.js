// @ts-check
const { danger, warn, message, markdown, fail } = require('danger')

/**
 * TOOLS-03: DangerJS Gatekeeper - Quality Gate++
 *
 * Enforces PR quality standards with hard gates for critical violations.
 * Soft warnings for advisory guidance.
 * Focus areas: LOC, documentation, tests, configurations
 */

const { pr, git } = danger

// 🎯 Rule 1: Quality Gate - Large PR Block (LOC > 600)
const changedFiles = git.created_files.concat(git.modified_files)
const lineCount = git.lines_of_code
const hasLargeDiffLabel = pr.labels.some(label => label.name === 'large-diff')

if (lineCount > 600 && !hasLargeDiffLabel) {
  fail(`🚫 **Large PR Blocked**: ${lineCount} lines of code changed. PRs > 600 LOC require 'large-diff' label for approval.`)
} else if (lineCount > 300) {
  warn(`📏 **Large PR Detected**: ${lineCount} lines of code changed. Consider breaking this into smaller PRs for easier review.`)
}

// 🎯 Rule 2: Quality Gate - Documentation Reports Required
const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
const hasReportLinks = pr.body.includes(`backend/docs/reports/${today}/`) ||
                      pr.body.includes(`docs/reports/${today}/`)

const hasSignificantChanges = lineCount > 100 ||
                             changedFiles.some(file => file.includes('backend/app/Http/') ||
                                                       file.includes('backend/config/') ||
                                                       file.includes('backend/database/'))

if (hasSignificantChanges && !hasReportLinks) {
  fail(`🚫 **Missing Documentation**: Significant changes detected but no links to today's reports (${today}) found in PR description.`)
}

// 🎯 Rule 3: Quality Gate - Controller Changes Require Tests
const controllerChanges = changedFiles.filter(file => file.includes('backend/app/Http/Controllers/'))
const hasTestChanges = changedFiles.some(file =>
  file.includes('test') || file.includes('spec') || file.includes('Test.php')
)

if (controllerChanges.length > 0 && !hasTestChanges) {
  fail(`🚫 **Controller Tests Required**: Backend controllers modified (${controllerChanges.join(', ')}) but no test files updated.`)
}

// 🎯 Rule 4: Quality Gate - Config Changes Require Risk Assessment
const configChanges = changedFiles.filter(file => file.includes('backend/config/') || file.includes('config/'))
const hasRiskAssessment = pr.body.toLowerCase().includes('risk') &&
                          (pr.body.toLowerCase().includes('low') ||
                           pr.body.toLowerCase().includes('medium') ||
                           pr.body.toLowerCase().includes('high'))

if (configChanges.length > 0 && !hasRiskAssessment) {
  fail(`🚫 **Risk Assessment Required**: Configuration changes detected (${configChanges.join(', ')}) but no risk level mentioned in PR description.`)
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

// 🎯 Rule 5: Soft Warning - Skipped CI Jobs
const prTitle = pr.title.toLowerCase()
const prBody = pr.body.toLowerCase()
const hasSkippedTests = prTitle.includes('skip') || prBody.includes('skip') ||
                       prTitle.includes('[ci skip]') || prBody.includes('[ci skip]')

if (hasSkippedTests && (hasFrontendChanges || hasE2EFiles)) {
  warn(`⚠️ **Test Coverage**: Frontend/E2E changes detected but tests may be skipped. Ensure Lighthouse and E2E tests run before merge.`)
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
## 🎯 TOOLS-03 Quality Gate++ Summary

${Object.entries(stats).map(([key, value]) => `**${key}**: ${value}`).join('\n')}

### Quality Gates Enforced 🚫
- Large PRs (>600 LOC) require \`large-diff\` label
- Significant changes require documentation reports
- Controller changes require test updates
- Config changes require risk assessment

---
*Quality gates active - Some violations will block merge* 🔴
`)