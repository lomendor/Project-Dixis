#!/usr/bin/env node

/**
 * CodeMap Subagent - Git diff-based change analysis
 * Analyzes git changes to identify risks and generate focused reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxFileSize: 300,
  maxComplexity: 10,
  outputDir: 'docs/reports',
  baseBranch: 'main'
};

// Analysis state
const analysis = {
  changedFiles: [],
  totalLOCDelta: { added: 0, deleted: 0 },
  risks: { high: [], medium: [], low: [] },
  integrationPoints: [],
  newFiles: [],
  modifiedFiles: [],
  deletedFiles: []
};

/**
 * Main analysis entry point
 */
async function runCodeMapAnalysis() {
  console.log('🗺️  CodeMap Subagent - Git diff analysis...\n');

  try {
    // Ensure output directory exists
    const dateDir = ensureOutputDir();

    // Get git diff information
    await analyzeGitDiff();

    // Analyze changed files
    await analyzeChangedFiles();

    // Generate reports
    const { codemapPath, risksPath } = await generateReports(dateDir);

    // Display summary
    displaySummary();

    console.log(`\n✅ Analysis complete!`);
    console.log(`📊 CODEMAP: ${codemapPath}`);
    console.log(`⚠️  RISKS: ${risksPath}`);

  } catch (error) {
    console.error('❌ CodeMap analysis failed:', error.message);
    process.exit(1);
  }
}

/**
 * Analyze git diff to get changed files and stats
 */
async function analyzeGitDiff() {
  try {
    // Get list of changed files
    const diffFiles = execSync(`git diff --name-status ${CONFIG.baseBranch}...HEAD`, { encoding: 'utf8' });

    for (const line of diffFiles.split('\n').filter(Boolean)) {
      const [status, filePath] = line.split('\t');

      if (!filePath || !isSourceFile(filePath)) continue;

      const fileInfo = {
        path: filePath,
        status: status,
        loc: 0,
        locDelta: { added: 0, deleted: 0 }
      };

      // Get LOC statistics for this file
      try {
        const diffStat = execSync(`git diff --numstat ${CONFIG.baseBranch}...HEAD -- "${filePath}"`, { encoding: 'utf8' });
        const [added, deleted] = diffStat.trim().split('\t').map(n => parseInt(n) || 0);

        fileInfo.locDelta = { added, deleted };
        analysis.totalLOCDelta.added += added;
        analysis.totalLOCDelta.deleted += deleted;

        // Get current file size if it exists
        if (status !== 'D' && fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          fileInfo.loc = content.split('\n').filter(line => line.trim().length > 0).length;
        }
      } catch (error) {
        console.warn(`⚠️  Could not get stats for ${filePath}`);
      }

      // Categorize files
      if (status === 'A') {
        analysis.newFiles.push(fileInfo);
      } else if (status === 'D') {
        analysis.deletedFiles.push(fileInfo);
      } else {
        analysis.modifiedFiles.push(fileInfo);
      }

      analysis.changedFiles.push(fileInfo);

      // Risk assessment
      assessChangeRisk(fileInfo);
    }

  } catch (error) {
    console.warn(`⚠️  Git diff analysis failed: ${error.message}`);
    console.warn('Note: Ensure you are on a feature branch with changes vs main');
  }
}

/**
 * Check if file is a source file we should analyze
 */
function isSourceFile(filename) {
  const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  return sourceExtensions.some(ext => filename.endsWith(ext)) &&
         !filename.includes('node_modules') &&
         !filename.includes('.next') &&
         !filename.includes('test-results');
}

/**
 * Analyze changed files for complexity and integration points
 */
async function analyzeChangedFiles() {
  for (const fileInfo of analysis.changedFiles) {
    if (fileInfo.status === 'D' || !fs.existsSync(fileInfo.path)) continue;

    try {
      const content = fs.readFileSync(fileInfo.path, 'utf8');

      // Check for API endpoints
      const apiRegex = /(?:fetch|axios|api)\s*\(\s*['"`]([^'"`]+)['"`]/g;
      let match;
      while ((match = apiRegex.exec(content)) !== null) {
        analysis.integrationPoints.push({
          file: fileInfo.path,
          type: 'API endpoint',
          value: match[1]
        });
      }

      // Check for type definitions
      if (fileInfo.path.includes('types') || content.includes('interface ') || content.includes('type ')) {
        analysis.integrationPoints.push({
          file: fileInfo.path,
          type: 'Type definitions',
          value: 'TypeScript interfaces/types'
        });
      }

      // Check for component exports
      if (content.includes('export default') || content.includes('export const')) {
        analysis.integrationPoints.push({
          file: fileInfo.path,
          type: 'Component export',
          value: 'React component or utility'
        });
      }

    } catch (error) {
      console.warn(`⚠️  Could not analyze content of ${fileInfo.path}: ${error.message}`);
    }
  }
}

/**
 * Assess risk level for a changed file
 */
function assessChangeRisk(fileInfo) {
  let riskLevel = 'low';
  const reasons = [];

  // Check file size risks
  if (fileInfo.loc > 250) {
    riskLevel = 'high';
    reasons.push(`Large file (${fileInfo.loc} LOC)`);
  } else if (fileInfo.loc > 150) {
    riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    reasons.push(`Medium-sized file (${fileInfo.loc} LOC)`);
  }

  // Check change size
  const totalDelta = fileInfo.locDelta.added + fileInfo.locDelta.deleted;
  if (totalDelta > 100) {
    riskLevel = 'high';
    reasons.push(`Large change (+${fileInfo.locDelta.added}/-${fileInfo.locDelta.deleted} LOC)`);
  } else if (totalDelta > 50) {
    riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    reasons.push(`Medium change (+${fileInfo.locDelta.added}/-${fileInfo.locDelta.deleted} LOC)`);
  }

  // Check critical paths
  if (fileInfo.path.includes('api') || fileInfo.path.includes('types') || fileInfo.path.includes('lib/')) {
    riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    reasons.push('Critical integration path');
  }

  const riskEntry = {
    file: fileInfo.path,
    status: fileInfo.status,
    loc: fileInfo.loc,
    locDelta: fileInfo.locDelta,
    reasons: reasons
  };

  analysis.risks[riskLevel].push(riskEntry);
}

/**
 * Generate CODEMAP and RISKS reports
 */
async function generateReports(dateDir) {
  const date = new Date().toISOString().split('T')[0];
  const codemapPath = path.join(dateDir, 'CODEMAP.md');
  const risksPath = path.join(dateDir, 'RISKS-NEXT.md');

  // Generate CODEMAP.md
  const codemapReport = `# 🗺️ Git Diff CodeMap Analysis - ${date}

## Changed Files Overview
- **Modified Files**: ${analysis.modifiedFiles.length}
- **Added Files**: ${analysis.newFiles.length}
- **Deleted Files**: ${analysis.deletedFiles.length}
- **Total LOC Delta**: +${analysis.totalLOCDelta.added}/-${analysis.totalLOCDelta.deleted}

## File Change Analysis

### Modified Files
${analysis.modifiedFiles.map(f =>
  `- ${f.path} (+${f.locDelta.added}/-${f.locDelta.deleted} LOC) [${f.loc} total LOC]`
).join('\n') || '- No files modified'}

### New Files
${analysis.newFiles.map(f =>
  `- ${f.path} (+${f.locDelta.added} LOC)`
).join('\n') || '- No files added'}

### Deleted Files
${analysis.deletedFiles.map(f =>
  `- ${f.path} (-${f.locDelta.deleted} LOC)`
).join('\n') || '- No files deleted'}

## Complexity Impact

### Large Changes (>50 LOC delta)
${analysis.changedFiles
  .filter(f => (f.locDelta.added + f.locDelta.deleted) > 50)
  .map(f => `- ${f.path} (+${f.locDelta.added}/-${f.locDelta.deleted} LOC)`)
  .join('\n') || '- No large changes detected'}

### File Size Concerns (>200 LOC)
${analysis.changedFiles
  .filter(f => f.loc > 200)
  .map(f => `- ${f.path} (${f.loc} LOC total)`)
  .join('\n') || '- No large files in changes'}

## Integration Points Affected
${analysis.integrationPoints.map(ip =>
  `- **${ip.type}**: ${ip.file} - ${ip.value}`
).join('\n') || '- No integration points detected'}

### PR Size Validation
- **Total Change Size**: ${analysis.totalLOCDelta.added + analysis.totalLOCDelta.deleted} LOC
- **PR Limit Compliance**: ${(analysis.totalLOCDelta.added + analysis.totalLOCDelta.deleted) <= 300 ? '✅ Within 300 LOC limit' : '❌ Exceeds 300 LOC limit'}

---
*Generated by CodeMap Subagent - ${new Date().toISOString()}*
*Analysis scope: Git diff vs ${CONFIG.baseBranch}*
`;

  // Generate RISKS-NEXT.md
  const risksReport = `# ⚠️ Risk Assessment - Next Steps

## High Priority Risks
${analysis.risks.high.length > 0 ?
  analysis.risks.high.map(r =>
    `- 🔴 **${r.file}** (${r.status}): ${r.reasons.join(', ')}\n  - *Action*: ${getActionPlan(r)}`
  ).join('\n') :
  '- ✅ No high-priority risks detected'}

## Medium Priority Risks
${analysis.risks.medium.length > 0 ?
  analysis.risks.medium.map(r =>
    `- 🟡 **${r.file}** (${r.status}): ${r.reasons.join(', ')}\n  - *Monitor*: ${getMonitoringPlan(r)}`
  ).join('\n') :
  '- ✅ No medium-priority risks detected'}

## Validation Required

### Test Coverage
- [ ] Unit tests for new functions in modified files
- [ ] Integration tests for API changes
- [ ] E2E smoke tests for user-facing changes
${analysis.integrationPoints.filter(ip => ip.type === 'API endpoint').length > 0 ?
  '- [ ] API endpoint validation tests' : ''}

### Code Quality
- [ ] TypeScript compilation passes
- [ ] ESLint warnings resolved
- [ ] Bundle size impact reviewed
- [ ] Performance impact assessed

### Integration Validation
${analysis.integrationPoints.map(ip =>
  `- [ ] Verify ${ip.type} in ${ip.file}`
).join('\n') || '- [ ] No specific integration validations required'}

## Pre-Merge Checklist

### Critical Requirements
- [ ] All high-risk items addressed or justified
- [ ] PR stays within 300 LOC limit (Current: ${analysis.totalLOCDelta.added + analysis.totalLOCDelta.deleted} LOC)
- [ ] Quality gates pass (npm run qa:all)
- [ ] Smoke tests pass (npm run e2e:smoke)

### Documentation
- [ ] CODEMAP analysis reviewed
- [ ] Risk mitigation plans documented
- [ ] Breaking changes documented (if any)

### Deployment Readiness
- [ ] Staging environment tested
- [ ] Performance benchmarks validated
- [ ] Rollback plan prepared (if needed)

---
*Generated by CodeMap Subagent - ${new Date().toISOString()}*
*Risk assessment based on git diff analysis*
`;

  fs.writeFileSync(codemapPath, codemapReport);
  fs.writeFileSync(risksPath, risksReport);

  return { codemapPath, risksPath };
}

/**
 * Get action plan for high-risk item
 */
function getActionPlan(riskItem) {
  if (riskItem.reasons.some(r => r.includes('Large file'))) {
    return 'Consider breaking into smaller modules or components';
  }
  if (riskItem.reasons.some(r => r.includes('Large change'))) {
    return 'Review change scope, consider splitting into multiple PRs';
  }
  if (riskItem.reasons.some(r => r.includes('Critical integration'))) {
    return 'Thorough testing required, coordinate with dependent teams';
  }
  return 'Review and validate implementation approach';
}

/**
 * Get monitoring plan for medium-risk item
 */
function getMonitoringPlan(riskItem) {
  if (riskItem.reasons.some(r => r.includes('Medium'))) {
    return 'Watch for complexity growth in future changes';
  }
  if (riskItem.reasons.some(r => r.includes('Critical integration'))) {
    return 'Monitor dependent systems after deployment';
  }
  return 'Standard monitoring and validation';
}

/**
 * Display console summary
 */
function displaySummary() {
  console.log('📊 Git Diff Analysis Summary:');
  console.log(`   Changed files: ${analysis.changedFiles.length}`);
  console.log(`   Added: ${analysis.newFiles.length} | Modified: ${analysis.modifiedFiles.length} | Deleted: ${analysis.deletedFiles.length}`);
  console.log(`   LOC delta: +${analysis.totalLOCDelta.added}/-${analysis.totalLOCDelta.deleted}`);
  console.log(`   Total change size: ${analysis.totalLOCDelta.added + analysis.totalLOCDelta.deleted} LOC`);
  console.log(`   High-risk files: ${analysis.risks.high.length}`);
  console.log(`   Medium-risk files: ${analysis.risks.medium.length}`);
  console.log(`   Integration points: ${analysis.integrationPoints.length}`);
  console.log(`   PR size compliance: ${(analysis.totalLOCDelta.added + analysis.totalLOCDelta.deleted) <= 300 ? '✅ Within 300 LOC' : '❌ Exceeds 300 LOC'}`);
}

/**
 * Ensure output directory exists and return date-specific path
 */
function ensureOutputDir() {
  const date = new Date().toISOString().split('T')[0];
  const dateDir = path.join(CONFIG.outputDir, date);

  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  if (!fs.existsSync(dateDir)) {
    fs.mkdirSync(dateDir, { recursive: true });
  }

  return dateDir;
}

// Run analysis if called directly
if (require.main === module) {
  runCodeMapAnalysis();
}

module.exports = { runCodeMapAnalysis };