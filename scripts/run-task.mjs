// 直接调用构建产物中的 attendance 任务，绕过 dev 服务器（CI 冷启动会卡死）
// 用法: pnpm build && node scripts/run-task.mjs
const mod = await import(new URL('../.output/server/_chunks/attendance.mjs', import.meta.url))
const task = mod.default
if (!task || typeof task.run !== 'function') {
  console.error('[skland] attendance 任务 chunk 未找到')
  process.exit(2)
}
const result = await task.run({ name: 'attendance', payload: {} })
console.log('[skland] 任务结果:', JSON.stringify(result))
process.exit(result && result.result === 'success' ? 0 : 1)
