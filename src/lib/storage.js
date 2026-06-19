// 轻量 localStorage 持久化（内网/离线运行，数据留在本机，契合「数据不出域」）
export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v == null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 忽略隐私模式 / 配额错误 */
  }
}
