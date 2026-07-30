const fs = require('fs');
const path = require('path');

const directoryToScan = path.join(__dirname, '../src');

// Regex patterns to replace
const replacements = [
  // Primary Color
  { regex: /bg-\[#FF724C\]/g, replace: 'bg-nexus-primary' },
  { regex: /bg-\[#FF6B57\]/g, replace: 'bg-nexus-primary' },
  { regex: /text-\[#FF724C\]/g, replace: 'text-nexus-primary' },
  { regex: /text-\[#FF6B57\]/g, replace: 'text-nexus-primary' },
  { regex: /border-\[#FF724C\]/g, replace: 'border-nexus-primary' },
  { regex: /border-\[#FF6B57\]/g, replace: 'border-nexus-primary' },
  { regex: /shadow-\[#FF724C\]/g, replace: 'shadow-nexus-primary' },
  { regex: /shadow-\[#FF6B57\]/g, replace: 'shadow-nexus-primary' },
  { regex: /ring-\[#FF724C\]/g, replace: 'ring-nexus-primary' },
  { regex: /ring-\[#FF6B57\]/g, replace: 'ring-nexus-primary' },
  { regex: /from-\[#FF724C\]/g, replace: 'from-nexus-primary' },
  { regex: /from-\[#FF6B57\]/g, replace: 'from-nexus-primary' },
  
  // Secondary Color
  { regex: /bg-\[#FDBF50\]/g, replace: 'bg-nexus-secondary' },
  { regex: /text-\[#FDBF50\]/g, replace: 'text-nexus-secondary' },
  { regex: /text-\[#f59e0b\]/g, replace: 'text-nexus-warning' }, // Using warning for amber text, but secondary for FDBF50
  { regex: /bg-\[#f59e0b\]/g, replace: 'bg-nexus-warning' },
  { regex: /border-\[#FDBF50\]/g, replace: 'border-nexus-secondary' },
  { regex: /from-\[#f59e0b\]/g, replace: 'from-nexus-warning' },
  { regex: /to-\[#f59e0b\]/g, replace: 'to-nexus-warning' },

  // Backgrounds
  { regex: /bg-\[#2A2C41\]/g, replace: 'bg-nexus-bg' },
  { regex: /bg-\[#020617\]/g, replace: 'bg-nexus-bg' },
  { regex: /bg-\[#0C1220\]/g, replace: 'bg-nexus-bg' },
  { regex: /bg-\[#0a0e1a\]/g, replace: 'bg-nexus-bg' },
  { regex: /bg-\[#070B1A\]/g, replace: 'bg-nexus-bg' },
  { regex: /bg-slate-950/g, replace: 'bg-nexus-bg' },

  // Surfaces/Cards
  { regex: /bg-\[#353756\]/g, replace: 'bg-nexus-surface' },
  { regex: /bg-\[#131b2f\]/g, replace: 'bg-nexus-surface' },
  { regex: /bg-slate-900/g, replace: 'bg-nexus-surface' },
  { regex: /dark:bg-\[#020617\]/g, replace: 'dark:bg-nexus-bg' },
  { regex: /dark:bg-\[#0C1220\]/g, replace: 'dark:bg-nexus-bg' },

  // Text
  { regex: /text-\[#F4F4F8\]/g, replace: 'text-nexus-text' },
  { regex: /text-\[#B8BBC7\]/g, replace: 'text-nexus-textSecondary' },
  { regex: /text-slate-400/g, replace: 'text-nexus-textSecondary' },
  { regex: /text-slate-300/g, replace: 'text-nexus-textSecondary' },
  { regex: /text-slate-500/g, replace: 'text-nexus-textSecondary' },
  
  // Borders
  { regex: /border-white\/10/g, replace: 'border-nexus-border' },
  { regex: /border-slate-800\/50/g, replace: 'border-nexus-border' },
  { regex: /border-slate-800/g, replace: 'border-nexus-border' },
  { regex: /border-slate-700/g, replace: 'border-nexus-border' },
  { regex: /dark:border-slate-800/g, replace: 'dark:border-nexus-border' },
  { regex: /border-white\/5/g, replace: 'border-nexus-border' },

  // Success/Warning/Error
  { regex: /text-\[#10b981\]/g, replace: 'text-nexus-success' },
  { regex: /bg-\[#10b981\]/g, replace: 'bg-nexus-success' },
  { regex: /border-\[#10b981\]/g, replace: 'border-nexus-success' },
  { regex: /from-\[#10b981\]/g, replace: 'from-nexus-success' },
  { regex: /to-\[#10b981\]/g, replace: 'to-nexus-success' },
  { regex: /text-\[#EF4444\]/g, replace: 'text-nexus-error' },
  { regex: /bg-\[#EF4444\]/g, replace: 'bg-nexus-error' },
];

let filesChanged = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css'))) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    filesChanged++;
  }
}

console.log('Starting UI/UX Consistency Audit script...');
walkDir(directoryToScan);
console.log(`\nAudit complete! Modified ${filesChanged} files to use Nexus Theme tokens.`);
