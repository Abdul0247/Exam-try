import { readFileSync, writeFileSync, existsSync } from 'fs';

function patchFile(filePath, description) {
  if (!existsSync(filePath)) {
    console.log(`Skipping ${description} - not found`);
    return;
  }

  let content = readFileSync(filePath, 'utf8');
  const original = content;

  // Fix isWrappedId arrow function
  content = content.replace(
    'const isWrappedId = (id, suffix) => id.endsWith(suffix);',
    'const isWrappedId = (id, suffix) => typeof id === "string" && id.endsWith(suffix);'
  );

  // Add a safe string check helper at the top if not already there
  const helper = '\nfunction __safeStr(v){return typeof v==="string"?v:""}\n';
  if (!content.includes('__safeStr')) {
    content = helper + content;
  }

  // Replace method calls with safe version
  content = content
    .replace(/\bimportee\.startsWith\b/g, '__safeStr(importee).startsWith')
    .replace(/\bimportee\.endsWith\b/g, '__safeStr(importee).endsWith')
    .replace(/\bimportee\.includes\b/g, '__safeStr(importee).includes')
    .replace(/\bsource\.startsWith\b/g, '__safeStr(source).startsWith')
    .replace(/\bsource\.endsWith\b/g, '__safeStr(source).endsWith')
    .replace(/\bsource\.includes\b/g, '__safeStr(source).includes')
    .replace(/\bid\.startsWith\b/g, '__safeStr(id).startsWith')
    .replace(/\bid\.endsWith\b/g, '__safeStr(id).endsWith')
    .replace(/\bid\.includes\b/g, '__safeStr(id).includes');

  if (content !== original) {
    writeFileSync(filePath, content);
    console.log(`Patched: ${description}`);
  } else {
    console.log(`No changes: ${description}`);
  }
}

patchFile(
  './node_modules/vinxi/node_modules/vite/dist/node/chunks/dep-Dq2t6Dq0.js',
  'vinxi bundled vite'
);

patchFile(
  './node_modules/@tanstack/start-plugin-core/dist/esm/import-protection-plugin/virtualModules.js',
  'tanstack virtualModules'
);

patchFile(
  './node_modules/@tanstack/start-plugin-core/dist/esm/import-protection-plugin/plugin.js',
  'tanstack plugin'
);

console.log('All patches applied.');