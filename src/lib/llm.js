// OpenAI 兼容 Chat 接口客户端 —— 用于「AI 法务助手」真实调用已部署的模型服务
// （如智海-录问 / LexiLaw 私有化部署，或任何 /v1 兼容端点）。

export function hasModel(settings) {
  return !!(settings && settings.modelEndpoint && settings.modelEndpoint.trim())
}

export async function chatComplete(settings, messages, { signal } = {}) {
  const base = settings.modelEndpoint.trim().replace(/\/+$/, '')
  // endpoint 形如 http://host:port/v1 → 调用 /v1/chat/completions
  const url = /\/v\d+$/.test(base) ? `${base}/chat/completions` : `${base}/v1/chat/completions`
  const headers = { 'Content-Type': 'application/json' }
  if (settings.modelKey && settings.modelKey.trim()) {
    headers['Authorization'] = `Bearer ${settings.modelKey.trim()}`
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      model: settings.modelName || 'default',
      temperature: 0.3,
      messages,
    }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`模型服务返回 ${res.status}${t ? ' · ' + t.slice(0, 120) : ''}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || '（模型返回为空）'
}

export const SYSTEM_PROMPT =
  '你是企业内网部署的法务 AI 助手，服务于企业法务/合规人员。回答须：依据中国现行法律法规，' +
  '标注法条出处，给出可执行建议；涉及个人信息先脱敏；明确这是辅助意见，重大事项须法务复核。'
