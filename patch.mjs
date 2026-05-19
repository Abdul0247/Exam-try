import { readFileSync, writeFileSync } from 'fs';

const path = './node_modules/vinxi/node_modules/vite/dist/node/chunks/dep-Dq2t6Dq0.js';
let content = readFileSync(path, 'utf8');

// Fix all non-string method calls on importee and id
content = content
  .replace(
    'const isWrappedId = (id, suffix) => id.endsWith(suffix);',
    'const isWrappedId = (id, suffix) => typeof id === "string" && id.endsWith(suffix);'
  )
  .replace(
    /importee\.endsWith\(/g,
    '(typeof importee === "string") && importee.endsWith('
  )
  .replace(
    /importee\.startsWith\(/g,
    '(typeof importee === "string") && importee.startsWith('
  )
  .replace(
    /importee\.includes\(/g,
    '(typeof importee === "string") && importee.includes('
  );

writeFileSync(path, content);
console.log('Patched successfully');