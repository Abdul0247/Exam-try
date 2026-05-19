import { readFileSync, writeFileSync, existsSync } from 'fs';

const path = './node_modules/vinxi/node_modules/vite/dist/node/chunks/dep-Dq2t6Dq0.js';

if (!existsSync(path)) {
  console.log('Patch target not found, skipping.');
  process.exit(0);
}

let content = readFileSync(path, 'utf8');

const patched = content
  .replace(
    'const isWrappedId = (id, suffix) => id.endsWith(suffix);',
    'const isWrappedId = (id, suffix) => typeof id === "string" && id.endsWith(suffix);'
  )
  .replace(
    /\bimportee\.endsWith\b/g,
    '(typeof importee === "string" ? importee : "").endsWith'
  )
  .replace(
    /\bimportee\.startsWith\b/g,
    '(typeof importee === "string" ? importee : "").startsWith'
  )
  .replace(
    /\bimportee\.includes\b/g,
    '(typeof importee === "string" ? importee : "").includes'
  )
  .replace(
    /\bsource\.startsWith\b/g,
    '(typeof source === "string" ? source : "").startsWith'
  )
  .replace(
    /\bsource\.endsWith\b/g,
    '(typeof source === "string" ? source : "").endsWith'
  )
  .replace(
    /\bsource\.includes\b/g,
    '(typeof source === "string" ? source : "").includes'
  );

writeFileSync(path, patched);
console.log('Patched vinxi vite successfully.');