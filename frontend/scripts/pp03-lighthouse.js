#!/usr/bin/env node

/**
 * PP03-E3 Lighthouse Performance Audit
 * Generates performance reports for key Dixis pages
 */

const { execSync } = require('child_process');
const fs = require('fs');

const baseUrl = 'http://localhost:3001';
const outputDir = 'lighthouse-reports';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Key pages for PP03 audit
const pages = [
  { name: 'home', url: `${baseUrl}/` },
  { name: 'product-detail', url: `${baseUrl}/products/1` },
  { name: 'cart', url: `${baseUrl}/cart` },
  { name: 'analytics-dashboard', url: `${baseUrl}/admin/analytics` }
];

console.log('🚀 PP03-E3 Lighthouse Audit\n');

// Check server
try {
  execSync(`curl -s ${baseUrl} > /dev/null`, { stdio: 'ignore' });
  console.log('✅ Server running at', baseUrl);
} catch {
  console.error('❌ Server not running. Start with: npm run dev -- --port 3001');
  process.exit(1);
}

const results = {};

// Run audits
for (const page of pages) {
  console.log(`\n📊 Auditing: ${page.name} (${page.url})`);
  
  try {
    const cmd = [
      'npx lighthouse',
      `"${page.url}"`,
      `--output=json`,
      `--output-path="${outputDir}/${page.name}-report.json"`,
      '--chrome-flags="--headless --no-sandbox"',
      '--only-categories=performance,accessibility,best-practices,seo',
      '--quiet'
    ].join(' ');
    
    execSync(cmd, { stdio: 'pipe' });
    
    // Parse results
    const jsonPath = `${outputDir}/${page.name}-report.json`;
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const scores = data.categories;
      
      results[page.name] = {
        performance: Math.round(scores.performance?.score * 100) || 0,
        accessibility: Math.round(scores.accessibility?.score * 100) || 0,
        bestPractices: Math.round(scores['best-practices']?.score * 100) || 0,
        seo: Math.round(scores.seo?.score * 100) || 0
      };
      
      const avg = Math.round(Object.values(results[page.name]).reduce((a, b) => a + b) / 4);
      console.log(`✅ Score: ${avg}/100 (P:${results[page.name].performance} A:${results[page.name].accessibility} BP:${results[page.name].bestPractices} S:${results[page.name].seo})`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
}

// Summary
const successfulAudits = Object.keys(results).length;
if (successfulAudits > 0) {
  const overallScore = Math.round(
    Object.values(results).reduce((sum, scores) => 
      sum + Object.values(scores).reduce((a, b) => a + b) / 4, 0
    ) / successfulAudits
  );
  
  console.log(`\n🎯 Overall Score: ${overallScore}/100`);
  console.log(overallScore >= 90 ? '🟢 Excellent - Production ready!' : 
              overallScore >= 75 ? '🟡 Good - Minor optimizations needed' : 
              '🟠 Needs improvement');
  
  // Save summary
  fs.writeFileSync(`${outputDir}/pp03-summary.json`, JSON.stringify({
    timestamp: new Date().toISOString(),
    overallScore,
    results
  }, null, 2));
  
  console.log(`\n📄 Summary: ${outputDir}/pp03-summary.json`);
}

console.log('✨ PP03-E3 audit complete!');