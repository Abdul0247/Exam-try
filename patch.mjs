import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

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

  // Make slash$1 tolerant of non-string input (vinxi's bundled vite)
  content = content.replace(
    'function slash$1(p) {\n  return p.replace(windowsSlashRE, "/");\n}',
    'function slash$1(p) {\n  if (typeof p !== "string") return p;\n  return p.replace(windowsSlashRE, "/");\n}'
  );

  // Make cleanUrl tolerant of non-string ids that are forwarded by the resolver.
  content = content.replace(
    'function cleanUrl(url) {\n  return url.replace(postfixRE, "");\n}',
    'function cleanUrl(url) {\n  if (typeof url !== "string") return "";\n  return url.replace(postfixRE, "");\n}'
  );

  // If cleanUrl is already patched, keep splitFileAndPostfix from slicing non-strings.
  content = content.replace(
    'function splitFileAndPostfix(path) {\n  const file = cleanUrl(path);\n  return { file, postfix: path.slice(file.length) };\n}',
    'function splitFileAndPostfix(path) {\n  if (typeof path !== "string") return { file: "", postfix: "" };\n  const file = cleanUrl(path);\n  return { file, postfix: path.slice(file.length) };\n}'
  );

  // Asset resolver receives Rollup ids before every plugin normalizes them.
  content = content.replace(
    'handler(id) {\n        if (!config.assetsInclude(cleanUrl(id)) && !urlRE$1.test(id)) {',
    'handler(id) {\n        if (typeof id !== "string") return;\n        if (!config.assetsInclude(cleanUrl(id)) && !urlRE$1.test(id)) {'
  );

  // Vite/Rollup sometimes forwards non-string entry ids through the resolver in this stack.
  // Guard the exact bundled resolver branch that otherwise crashes production builds with
  // `id.startsWith is not a function` before app code is compiled.
  content = content.replace(
    'async resolveId(id, importer, resolveOpts) {\n      if (id[0] === "\\0" || id.startsWith("virtual:") || // When injected directly in html/client code\n      id.startsWith("/virtual:")) {',
    'async resolveId(id, importer, resolveOpts) {\n      if (typeof id !== "string") return;\n      if (id[0] === "\\0" || id.startsWith("virtual:") || // When injected directly in html/client code\n      id.startsWith("/virtual:")) {'
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

function patchViteChunks(viteChunksDir, description) {
  if (existsSync(viteChunksDir)) {
    for (const fileName of readdirSync(viteChunksDir)) {
      if (fileName.startsWith('dep-') && fileName.endsWith('.js')) {
        patchFile(join(viteChunksDir, fileName), `${description} ${fileName}`);
      }
    }
  } else {
    console.log(`Skipping ${description} - chunks directory not found`);
  }
}

patchViteChunks('./node_modules/vinxi/node_modules/vite/dist/node/chunks', 'vinxi bundled vite');
patchViteChunks('./node_modules/vite/dist/node/chunks', 'root vite');

patchFile(
  './node_modules/@tanstack/start-plugin-core/dist/esm/import-protection-plugin/virtualModules.js',
  'tanstack virtualModules'
);

patchFile(
  './node_modules/@tanstack/start-plugin-core/dist/esm/import-protection-plugin/plugin.js',
  'tanstack plugin'
);

console.log('All patches applied.');