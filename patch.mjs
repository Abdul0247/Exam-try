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

const filterBefore = `filter: { id: /tsr-split/ }`
const filterAfter = `filter: { id: /src\\/routes\\/.*tsr-split/ }`
const handlerBefore = `handler(code, id) {
					const url = pathToFileURL(id);`
const handlerAfter = `handler(code, id) {
					if (!id.includes('/src/routes/') && !id.includes('\\\\src\\\\routes\\\\')) return null;
					const url = pathToFileURL(id);`

const viteJsonFile = 'node_modules/vite/dist/node/chunks/config.js'
const jsonBefore = `handler(json, id) {
				if (inlineRE$3.test(id) || noInlineRE.test(id))`
const jsonAfter = `handler(json, id) {
				if (!/\\.json(?:$|\\?)/.test(id)) return null;
				if (inlineRE$3.test(id) || noInlineRE.test(id))`

for (const file of files) {
  if (!existsSync(file)) continue
  let source = readFileSync(file, 'utf8')
  const original = source
  source = source.replace(filterBefore, filterAfter)
  source = source.replace(handlerBefore, handlerAfter)
  source = source.replace(previousAfter, before)
  source = source.replace(after, before)
  if (source !== original) {
    writeFileSync(file, source)
    console.log(`Patched ${file}`)
  }
}

if (existsSync(viteJsonFile)) {
  const source = readFileSync(viteJsonFile, 'utf8')
  if (!source.includes(jsonAfter) && source.includes(jsonBefore)) {
    writeFileSync(viteJsonFile, source.replace(jsonBefore, jsonAfter))
    console.log(`Patched ${viteJsonFile}`)
  }
}