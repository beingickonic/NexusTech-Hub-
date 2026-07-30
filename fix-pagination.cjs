const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.js'));

const paginationCode = [
  "const DEFAULT_LIMIT = 10;",
  "const DEFAULT_LIMIT = 15;",
  "const pageRange = (page = 1, limit = DEFAULT_LIMIT) => {",
  "  const from = (Number(page) - 1) * Number(limit);",
  "  return { from, to: from + Number(limit) - 1 };",
  "};",
  "",
  "const responseMeta = (count = 0, page = 1, limit = DEFAULT_LIMIT) => ({",
  "  page: Number(page),",
  "  limit: Number(limit),",
  "  total: count || 0,",
  "  totalPages: Math.max(1, Math.ceil((count || 0) / Number(limit)))",
  "});"
];

files.forEach(file => {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('const pageRange =')) {
    // Add import statement
    if (!content.includes('import { DEFAULT_LIMIT, pageRange, responseMeta }')) {
       // Replace the definitions using regex since they span multiple lines
       const regex = /const DEFAULT_LIMIT = \d+;[\s\S]+?const pageRange =[\s\S]+?};\s+const responseMeta =[\s\S]+?}\);/m;
       if(regex.test(content)) {
           content = content.replace(regex, "import { DEFAULT_LIMIT, pageRange, responseMeta } from '../utils/pagination';");
           fs.writeFileSync(filePath, content, 'utf8');
           console.log('Updated', file);
       } else {
           console.log('Regex did not match for', file);
       }
    }
  }
});
