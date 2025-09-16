#!/usr/bin/env node

/**
 * CodeMap Subagent - Lightweight codebase analysis
 * Generates structure, complexity, and risk assessment reports
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  maxFileSize: 300,
  maxComplexity: 10,
  maxNesting: 4,
  maxParams: 5,
  srcPath: 'src',
  outputDir: 'docs/research',
  excludePaths: ['node_modules', '.next', 'test-results', '.git', 'dist', 'build']
};

// Analysis state
const analysis = {
  files: [],
  totalLOC: 0,
  complexFunctions: [],
  largeFiles: [],
  apiEndpoints: [],
  risks: { high: [], medium: [], low: [] }
};

/**
 * Main analysis entry point
 */
async function runCodeMapAnalysis() {
  console.log('🗺️  CodeMap Subagent - Starting analysis...\n');

  try {
    // Ensure output directory exists
    ensureOutputDir();

    // Scan source directory
    scanDirectory(CONFIG.srcPath);

    // Perform analysis
    analyzeFiles();

    // Generate report
    const reportPath = generateReport();

    // Display summary
    displaySummary();

    console.log(`\n✅ Analysis complete! Report saved to: ${reportPath}`);

  } catch (error) {
    console.error('❌ CodeMap analysis failed:', error.message);
    process.exit(1);
  }
}

/**
 * Recursively scan directory for source files
 */
function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Source directory '${dirPath}' not found`);
    return;
  }

  const entries = fs.readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !CONFIG.excludePaths.includes(entry)) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && isSourceFile(entry)) {
      analyzeFile(fullPath);
    }
  }
}

/**
 * Check if file is a source file we should analyze
 */
function isSourceFile(filename) {
  const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  return sourceExtensions.some(ext => filename.endsWith(ext)) &&
         !filename.endsWith('.test.ts') &&
         !filename.endsWith('.spec.ts');
}

/**
 * Analyze individual file
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const loc = lines.filter(line => line.trim().length > 0).length;

    const fileInfo = {
      path: filePath,
      loc: loc,
      lines: lines.length,
      functions: [],
      apiCalls: [],
      complexity: 0
    };

    // Analyze file content
    analyzeFileContent(content, fileInfo);

    analysis.files.push(fileInfo);
    analysis.totalLOC += loc;

    // Risk assessment
    assessFileRisk(fileInfo);

  } catch (error) {
    console.warn(`⚠️  Could not analyze ${filePath}: ${error.message}`);
  }
}

/**
 * Analyze file content for complexity and patterns
 */
function analyzeFileContent(content, fileInfo) {
  const lines = content.split('\n');

  // Find functions and calculate complexity
  const functionRegex = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\(|export\s+(?:async\s+)?function)/g;
  const apiCallRegex = /(?:fetch|axios|api)\s*\(\s*['"`]([^'"`]+)['"`]/g;

  let match;

  // Find API endpoints
  while ((match = apiCallRegex.exec(content)) !== null) {
    analysis.apiEndpoints.push(match[1]);
  }

  // Simple complexity analysis
  let complexity = 0;
  let maxNesting = 0;
  let currentNesting = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Count control flow statements for complexity
    if (trimmed.match(/\b(if|for|while|switch|catch|&&|\|\|)\b/)) {
      complexity++;
    }

    // Track nesting depth
    const openBraces = (trimmed.match(/{/g) || []).length;
    const closeBraces = (trimmed.match(/}/g) || []).length;
    currentNesting += openBraces - closeBraces;
    maxNesting = Math.max(maxNesting, currentNesting);
  }

  fileInfo.complexity = complexity;
  fileInfo.maxNesting = maxNesting;

  if (complexity > CONFIG.maxComplexity) {
    analysis.complexFunctions.push({
      file: fileInfo.path,
      complexity: complexity
    });
  }
}

/**
 * Assess risk level for a file
 */
function assessFileRisk(fileInfo) {
  let riskLevel = 'low';
  const reasons = [];

  if (fileInfo.loc > 250) {
    riskLevel = 'high';
    reasons.push(`Large file (${fileInfo.loc} LOC)`);
  } else if (fileInfo.loc > 150) {
    riskLevel = 'medium';
    reasons.push(`Medium file (${fileInfo.loc} LOC)`);
  }

  if (fileInfo.complexity > CONFIG.maxComplexity) {
    riskLevel = 'high';
    reasons.push(`High complexity (${fileInfo.complexity})`);
  }

  if (fileInfo.maxNesting > CONFIG.maxNesting) {
    riskLevel = 'high';
    reasons.push(`Deep nesting (${fileInfo.maxNesting} levels)`);
  }

  const riskEntry = {
    file: fileInfo.path,
    loc: fileInfo.loc,
    reasons: reasons
  };

  analysis.risks[riskLevel].push(riskEntry);
}

/**
 * Perform final analysis calculations
 */
function analyzeFiles() {
  // Sort files by size
  analysis.largeFiles = analysis.files
    .filter(f => f.loc > 100)
    .sort((a, b) => b.loc - a.loc)
    .slice(0, 10);

  // Deduplicate API endpoints
  analysis.apiEndpoints = [...new Set(analysis.apiEndpoints)];
}

/**
 * Generate markdown report
 */
function generateReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `CODEMAP-${timestamp}.md`;
  const reportPath = path.join(CONFIG.outputDir, filename);

  const avgFileSize = analysis.files.length > 0 ?
    Math.round(analysis.totalLOC / analysis.files.length) : 0;

  const report = `# 🗺️ CodeMap Analysis - ${new Date().toISOString()}

## Codebase Structure
- **Total Files**: ${analysis.files.length}
- **Total LOC**: ${analysis.totalLOC.toLocaleString()}
- **Average File Size**: ${avgFileSize} LOC
- **Source Directory**: ${CONFIG.srcPath}/

### Largest Files
${analysis.largeFiles.map(f =>
  `- ${f.path.replace(CONFIG.srcPath + '/', '')} (${f.loc} LOC)`
).join('\n') || '- No large files detected'}

## Complexity Analysis
- **High Complexity Functions**: ${analysis.complexFunctions.length}
- **Complexity Threshold**: ${CONFIG.maxComplexity}

${analysis.complexFunctions.length > 0 ? '### Complex Functions\n' +
  analysis.complexFunctions.map(f =>
    `- ${f.file.replace(CONFIG.srcPath + '/', '')} (complexity: ${f.complexity})`
  ).join('\n') : ''}

## Integration Points
- **API Endpoints**: ${analysis.apiEndpoints.length}
- **External Dependencies**: (requires package.json scan)

${analysis.apiEndpoints.length > 0 ? '### Discovered API Endpoints\n' +
  analysis.apiEndpoints.map(ep => `- ${ep}`).join('\n') : ''}

## Risk Assessment

### 🔴 High Risk (${analysis.risks.high.length} files)
${analysis.risks.high.map(r =>
  `- ${r.file.replace(CONFIG.srcPath + '/', '')} (${r.loc} LOC) - ${r.reasons.join(', ')}`
).join('\n') || '- No high-risk files detected'}

### 🟡 Medium Risk (${analysis.risks.medium.length} files)
${analysis.risks.medium.slice(0, 5).map(r =>
  `- ${r.file.replace(CONFIG.srcPath + '/', '')} (${r.loc} LOC) - ${r.reasons.join(', ')}`
).join('\n') || '- No medium-risk files detected'}

### 🟢 Low Risk
- **Files**: ${analysis.risks.low.length} files under 150 LOC with low complexity

## Recommendations

### Priority Actions
${analysis.risks.high.length > 0 ?
  '- 🔴 **Immediate**: Refactor high-risk files to reduce complexity\n' +
  '- 🔴 **Critical**: Break large files (>250 LOC) into smaller modules' :
  '- ✅ **Good**: No immediate high-risk issues detected'}

### Quality Improvements
- Consider breaking files >150 LOC into smaller, focused modules
- Add unit tests for complex functions (complexity >${CONFIG.maxComplexity})
- Review API integration patterns for consistency

### Architecture Notes
- Total codebase size: ${analysis.totalLOC.toLocaleString()} LOC
- Average file maintainability: ${avgFileSize < 100 ? 'Good' : avgFileSize < 200 ? 'Fair' : 'Needs Attention'}
- Complexity distribution: ${analysis.complexFunctions.length} functions need review

---
*Generated by CodeMap Subagent - ${new Date().toISOString()}*
*Analysis scope: ${CONFIG.srcPath}/ directory*
`;

  fs.writeFileSync(reportPath, report);
  return reportPath;
}

/**
 * Display console summary
 */
function displaySummary() {
  console.log('📊 Analysis Summary:');
  console.log(`   Files analyzed: ${analysis.files.length}`);
  console.log(`   Total LOC: ${analysis.totalLOC.toLocaleString()}`);
  console.log(`   Average file size: ${Math.round(analysis.totalLOC / analysis.files.length)} LOC`);
  console.log(`   High-risk files: ${analysis.risks.high.length}`);
  console.log(`   Complex functions: ${analysis.complexFunctions.length}`);
  console.log(`   API endpoints: ${analysis.apiEndpoints.length}`);
}

/**
 * Ensure output directory exists
 */
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
}

// Run analysis if called directly
if (require.main === module) {
  runCodeMapAnalysis();
}

module.exports = { runCodeMapAnalysis };