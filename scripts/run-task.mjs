// 直接调用构建产物中的 attendance 任务，绕过 dev 服务器（CI 冷启动会卡死）
// 用法: pnpm build && node scripts/run-task.mjs
// 任务文件可能落在 .output/server/_tasks 或 _chunks（rolldown 分块不稳定），两处都找
import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const base = join(dirname(fileURLToPath(import.meta.url)), '../.output/server')
const candidates = [join(base, '_tasks'), join(base, '_chunks')]
let file = null
let dir = null
for (const d of candidates) {
  if (!existsSync(d)) continue
  const f = readdirSync(d).find((x) => /^attendance.*[.]mjs$/.test(x))
  if (f) {
    file = f
    dir = d
    break
  }
}
if (!file) {
  console.error('[skland] 未找到 attendance 任务 chunk')
  console.error('已查找: ' + candidates.join(', '))
  console.error('.output/server 内容: ' + readdirSync(base).join(', '))
  process.exit(2)
}
const mod = await import(pathToFileURL(join(dir, file)).href)
const task = mod.default
if (!task || typeof task.run !== 'function') {
  console.error('[skland] chunk 缺少 run()')
  process.exit(2)
}
const result = await task.run({ name: 'attendance', payload: {} })
console.log('[skland] 任务结果:', JSON.stringify(result))
process.exit(result && result.result === 'success' ? 0 : 1)
