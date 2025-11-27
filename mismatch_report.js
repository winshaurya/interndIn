const fs = require('fs');
const path = require('path');

// Read schema file
const schemaPath = path.join(__dirname, 'backend/src/migrations/supabase_schema.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Extract tables and columns
const tableRegex = /CREATE TABLE IF NOT EXISTS public\.(\w+) \(([\s\S]*?)\);/g;
const tables = {};
let match;
while ((match = tableRegex.exec(schemaContent)) !== null) {
  const tableName = match[1];
  const columnsBlock = match[2];
  const columns = columnsBlock.split(',').map(col => col.trim().split(' ')[0]).filter(col => col && !col.includes('(') && !col.startsWith('UNIQUE') && !col.startsWith('PRIMARY') && !col.startsWith('REFERENCES'));
  tables[tableName] = columns;
}

console.log('Extracted tables:', tables);

// Now, read all JS files in backend/src
const srcDir = path.join(__dirname, 'backend/src');
const jsFiles = [];

function getJSFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getJSFiles(fullPath);
    } else if (file.endsWith('.js')) {
      jsFiles.push(fullPath);
    }
  });
}

getJSFiles(srcDir);

// Collect code usages
const codeColumns = {};
const reqBodyFields = new Set();

jsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Find db.from('table').select('col1', 'col2')
  const selectRegex = /db\.from\(['"`](\w+)['"`]\)\.select\(['"`]([\s\S]*?)['"`]\)/g;
  let selMatch;
  while ((selMatch = selectRegex.exec(content)) !== null) {
    const table = selMatch[1];
    const cols = selMatch[2].split(',').map(c => c.trim().replace(/['"`]/g, ''));
    if (!codeColumns[table]) codeColumns[table] = new Set();
    cols.forEach(col => codeColumns[table].add(col));
  }

  // Find req.body.field
  const bodyRegex = /req\.body\.(\w+)/g;
  let bodyMatch;
  while ((bodyMatch = bodyRegex.exec(content)) !== null) {
    reqBodyFields.add(bodyMatch[1]);
  }

  // Find update fields
  const updateRegex = /db\.from\(['"`](\w+)['"`]\)\.update\(\{([\s\S]*?)\}\)/g;
  let updMatch;
  while ((updMatch = updateRegex.exec(content)) !== null) {
    const table = updMatch[1];
    const fields = updMatch[2].split(',').map(f => f.split(':')[0].trim());
    if (!codeColumns[table]) codeColumns[table] = new Set();
    fields.forEach(field => codeColumns[table].add(field));
  }
});

// Report mismatches
console.log('\n=== MISMATCH REPORT ===');
for (const table in tables) {
  const schemaCols = new Set(tables[table]);
  const codeCols = codeColumns[table] || new Set();

  const missingInSchema = [...codeCols].filter(col => !schemaCols.has(col));
  const unusedInSchema = [...schemaCols].filter(col => !codeCols.has(col));

  if (missingInSchema.length > 0 || unusedInSchema.length > 0) {
    console.log(`\nTable: ${table}`);
    if (missingInSchema.length > 0) {
      console.log(`  Columns used in code but missing in schema: ${missingInSchema.join(', ')}`);
    }
    if (unusedInSchema.length > 0) {
      console.log(`  Columns in schema but not used in code: ${unusedInSchema.join(', ')}`);
    }
  }
}

console.log('\nreq.body fields found:', [...reqBodyFields]);
