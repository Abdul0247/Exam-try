import { readFileSync, writeFileSync, existsSync } from 'fs';

function patchFile(filePath, description) {
  if (!existsSync(filePath)) {
    console.log(`Skipping ${description} - not found`);
    return;
  }

  let content = readFileSync(filePath, 'utf8');
  const original = content;

  content = content
    .replace(
      'const isWrappedId = (id, suffix) => id.endsWith(suffix);',
      'const isWrappedId = (id, suffix) => typeof id === "string" && id.endsWith(suffix);'
    )
    .replace(/\bimportee\.endsWith\b/g, '(typeof importee === "string" ? importee : "").endsWith')
    .replace(/\bimportee\.startsWith\b/g, '(typeof importee === "string" ? importee : "").startsWith')
    .replace(/\bimportee\.includes\b/g, '(typeof importee === "string" ? importee : "").includes')
    .replace(/\bsource\.startsWith\b/g, '(typeof source === "string" ? source : "").startsWith')
    .replace(/\bsource\.endsWith\b/g, '(typeof source === "string" ? source : "").endsWith')
    .replace(/\bsource\.includes\b/g, '(typeof source === "string" ? source : "").includes')
    .replace(/\bid\.startsWith\b/g, '(typeof id === "string" ? id : "").startsWith')
    .replace(/\bid\.endsWith\b/g, '(typeof id === "string" ? id : "").endsWith')
    .replace(/\bid\.includes\b/g, '(typeof id === "string" ? id : "").includes');

  if (content !== original) {
    writeFileSync(filePath, content);
    console.log(`Patched: ${description}`);
  } else {
    console.log(`No changes needed: ${description}`);
  }
}

patchFile(
  './node_modules/vinxi/node_modules/vite/dist/node/chunks/dep-Dq2t6Dq0.js',
  'vinxi bundled vite'
);

patchFile(
  './node_modules/@tanstack/start-plugin-core/dist/esm/import-protection-plugin/virtualModules.js',
  'tanstack start-plugin-core virtualModules'
);

patchFile(
  './node_modules/@tanstack/start-plugin-core/dist/esm/import-protection-plugin/plugin.js',
  'tanstack start-plugin-core plugin'
);

console.log('All patches applied.');