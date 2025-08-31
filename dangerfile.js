// @ts-check
import { danger, warn, message, markdown } from 'danger'

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

// 🎯 Rule 4: Port Compliance Check (Critical Guardrails)
const fileContents = await Promise.all(
  changedFiles
    .filter(file => file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.yml') || file.endsWith('.yaml'))
    .map(async file => {
      try {
        const content = await danger.github.repos.getContent({
          owner: pr.head.repo.owner.login,
          repo: pr.head.repo.name,
          path: file,
          ref: pr.head.sha
        })
        return { file, content: Buffer.from(content.data.content, 'base64').toString() }
      } catch {
        return null
      }
    })
)

const portViolations = []
const versionIssues = []

fileContents.forEach(item => {
  if (!item) return
  
  const { file, content } = item
  
  // Check for forbidden ports
  if (content.includes(':8000') && !content.includes('127.0.0.1:8001')) {
    portViolations.push(`${file}: Found :8000 (should be :8001)`)
  }
  if (content.includes(':3000') && !content.includes('127.0.0.1:3001')) {
    portViolations.push(`${file}: Found :3000 (should be :3001)`)
  }
  
  // Check Next.js version compliance
  if (file.includes('package.json') && content.includes('"next"')) {
    if (!content.includes('"next": "15.5.0"')) {
      versionIssues.push(`${file}: Next.js version should be exactly 15.5.0`)
    }
  }
})

if (portViolations.length > 0) {
  warn(`🚨 **Port Compliance Issue**: Found legacy port references:\n${portViolations.map(v => `- ${v}`).join('\n')}`)
}

if (versionIssues.length > 0) {
  warn(`📦 **Version Compliance**: Found version issues:\n${versionIssues.map(v => `- ${v}`).join('\n')}`)
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