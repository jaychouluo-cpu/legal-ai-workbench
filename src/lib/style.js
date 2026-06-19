// 将设计原型中的内联样式字符串（"display:flex;gap:10px;..."）转换为
// React 所需的样式对象，从而 1:1 复用设计稿的视觉规格，保证高保真还原。
const cache = new Map()

export function s(str) {
  if (!str) return undefined
  if (cache.has(str)) return cache.get(str)
  const obj = {}
  for (const decl of str.split(';')) {
    const i = decl.indexOf(':')
    if (i === -1) continue
    const rawKey = decl.slice(0, i).trim()
    const val = decl.slice(i + 1).trim()
    if (!rawKey) continue
    // 自定义属性（--var）保持原样；其余转成 camelCase
    const key = rawKey.startsWith('--')
      ? rawKey
      : rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    obj[key] = val
  }
  cache.set(str, obj)
  return obj
}

// 合并多个样式对象/字符串
export function merge(...parts) {
  return Object.assign({}, ...parts.map((p) => (typeof p === 'string' ? s(p) : p)))
}
