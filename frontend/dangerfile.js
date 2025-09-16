import { danger, warn, fail, message } from 'danger';

// Get PR info
const pr = danger.github.pr;
const modifiedFiles = danger.git.modified_files;
const createdFiles = danger.git.created_files;
// const deletedFiles = danger.git.deleted_files; // Not currently used
const allFiles = [...modifiedFiles, ...createdFiles];

// Check PR title follows conventional commit format
const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?: .{1,72}/;
if (!conventionalCommitRegex.test(pr.title)) {
  fail('❌ PR title must follow conventional commit format: `type(scope): description`');
}

// Check PR body structure
const prBody = pr.body || '';
const requiredSections = [
  'Summary',
  'Acceptance Criteria',
  'Test Plan',
  'Reports'
];

const missingSections = requiredSections.filter(section => {
  const regex = new RegExp(`## ${section}`, 'i');
  return !regex.test(prBody);
});

if (missingSections.length > 0) {
  fail(`❌ PR body is missing required sections: ${missingSections.join(', ')}`);
}

// Check for 3 reports links in PR body
const reportLinks = prBody.match(/\[.*\]\(docs\/reports\/.*\.md\)/g) || [];
if (reportLinks.length < 3) {
  warn(`⚠️ PR should include links to 3 reports (CODEMAP, TEST-REPORT, RISKS-NEXT). Found ${reportLinks.length}`);
}

// Check test summary is included
if (!prBody.toLowerCase().includes('test summary') && !prBody.toLowerCase().includes('test execution')) {
  warn('⚠️ PR should include a test summary or test execution results');
}

// File size and count checks
// Future enhancement: Check for large files
// const bigFiles = allFiles.filter(file => { ... });

if (allFiles.length > 20) {
  warn(`⚠️ This PR modifies ${allFiles.length} files. Consider breaking it into smaller PRs.`);
}

// Check for package.json changes
const packageJsonChanged = allFiles.includes('package.json');
if (packageJsonChanged) {
  message('📦 package.json was modified. Please ensure npm install works correctly.');
}

// Check for TypeScript config changes
const tsConfigChanged = allFiles.includes('tsconfig.json');
if (tsConfigChanged) {
  message('🔧 TypeScript configuration was modified. Please run type checking.');
}

// Check for ESLint config changes
const eslintConfigChanged = allFiles.some(file => file.includes('.eslintrc'));
if (eslintConfigChanged) {
  message('🔍 ESLint configuration was modified. Please run linting.');
}

// Check for test files
const testFiles = allFiles.filter(file =>
  file.includes('.test.') ||
  file.includes('.spec.') ||
  file.includes('tests/')
);

if (testFiles.length > 0) {
  message(`🧪 Tests modified: ${testFiles.length} test files`);
}

// Check for documentation files
const docFiles = allFiles.filter(file =>
  file.includes('.md') ||
  file.includes('docs/')
);

if (docFiles.length > 0) {
  message(`📚 Documentation updated: ${docFiles.length} documentation files`);
}

// Warn about large PRs (LOC count)
const linesOfCode = danger.github.utils.linesOfCode;
if (linesOfCode > 500) {
  warn(`⚠️ This PR has ${linesOfCode} lines of code. Consider breaking it into smaller PRs for easier review.`);
}

// Success message for well-structured PRs
if (conventionalCommitRegex.test(pr.title) && missingSections.length === 0) {
  message('✅ PR structure looks good! Title follows conventional commits and body includes required sections.');
}