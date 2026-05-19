import { readFileSync, writeFileSync, existsSync } from 'fs';

function patchFile(filePath, description) {
  if (!existsSync(filePath)) {
    console.log(`Skipping ${description} - not found`);
    return;
  }

  let content = readFileSync(filePath, 'utf8');
  const original = content;

  // Only fix the specific isWrappedId function
  content = content.replace(
    'const isWrappedId = (id, suffix) => id.endsWith(suffix);',
    'const isWrappedId = (id, suffix) => typeof id === "string" && id.endsWith(suffix);'
  );

  // Only fix importee and source method calls (not generic id)
  content = content
    .replace(/\bimportee\.startsWith\b/g, '(typeof importee==="string"?importee:"").startsWith')
    .replace(/\bimportee\.endsWith\b/g, '(typeof importee==="string"?importee:"").endsWith')
    .replace(/\bimportee\.includes\b/g, '(typeof importee==="string"?importee:"").includes')
    .replace(/\bsource\.startsWith\b/g, '(typeof source==="string"?source:"").startsWith')
    .replace(/\bsource\.endsWith\b/g, '(typeof source==="string"?source:"").endsWith')
    .replace(/\bsource\.includes\b/g, '(typeof source==="string"?source:"").includes');

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