// 直接调用构建产物中的 attendance 任务，绕过 dev 服务器（CI 冷启动会卡死）
// 用法: pnpm build && node scripts/run-task.mjs
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const chunksDir = join(dirname(fileURLToPath(import.meta.url)), '../.output/server/_chunks')
const files = readdirSync(chunksDir)
const file = files.find((f) => /^attendance.*[.]mjs$/.test(f))
if (!file) {
  console.error('[skland] 未找到 attendance 任务 chunk')
  console.error('chunks 目录内容: ' + files.join(', '))
  process.exit(2)
}
const mod = await import(pathToFileURL(join(chunksDir, file)).href)
const task = mod.default
if (!task || typeof task.run !== 'function') {
  console.error('[skland] chunk 缺少 run()')
  process.exit(2)
}
const result = await task.run({ name: 'attendance', payload: {} })
console.log('[skland] 任务结果:', JSON.stringify(result))
process.exit(result && result.result === 'success' ? 0 : 1)
