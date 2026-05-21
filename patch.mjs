import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const files = [
  'node_modules/@tanstack/router-plugin/dist/esm/core/router-code-splitter-plugin.js',
  'node_modules/@tanstack/start-plugin-core/node_modules/@tanstack/router-plugin/dist/esm/core/router-code-splitter-plugin.js',
]

const before = `url.searchParams.delete("v");
					return handleCompilingVirtualFile(code, normalizePath(fileURLToPath(url)));`

const after = `url.searchParams.delete("v");
					const normalizedId = normalizePath(fileURLToPath(url));
					if (!normalizedId.includes("?tsr-split=") && !normalizedId.includes("&tsr-split=")) return { code, map: null };
					return handleCompilingVirtualFile(code, normalizedId);`

const previousAfter = `url.searchParams.delete("v");
					const normalizedId = normalizePath(fileURLToPath(url));
					if (!normalizedId.includes("?tsr-split=") && !normalizedId.includes("&tsr-split=")) return null;
					return handleCompilingVirtualFile(code, normalizedId);`

for (const file of files) {
  if (!existsSync(file)) continue
  const source = readFileSync(file, 'utf8')
  if (source.includes(after)) continue
  if (source.includes(previousAfter)) {
    writeFileSync(file, source.replace(previousAfter, after))
    console.log(`Updated ${file}`)
    continue
  }
  if (!source.includes(before)) continue
  writeFileSync(file, source.replace(before, after))
  console.log(`Patched ${file}`)
}