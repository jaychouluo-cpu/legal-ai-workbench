import { createContext, useContext, useState, useCallback } from 'react'
import { load, save } from './storage.js'

// 全局配置：模型 endpoint 与各数据接口凭证。
// 仅「确需外部服务」的能力在此配置；本地能力（脱敏 / 合同审查 / 期限 / 文书 / 本地检索）无需任何密钥。
const KEY = 'lawbox.settings.v1'

const DEFAULTS = {
  // 模型服务（OpenAI 兼容，例如智海-录问私有化部署的 /v1）—— 驱动「AI 法务助手」
  modelEndpoint: '',
  modelName: 'wisdomInterrogatory',
  modelKey: '', // 内网私有化通常留空；公有 API 才需要
  // 数据接口凭证（确需密钥 / 账号的服务）
  qccKey: '',          // 企查查 API Key —— 驱动「企业核查」在线查询
  tycKey: '',          // 天眼查 API Key
  fabaoAccount: '',    // 北大法宝账号
  // 本地能力路径（非密钥）
  cncasesPath: '/data/cncases/index',
}

const Ctx = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...load(KEY, {}) }))

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      save(KEY, next)
      return next
    })
  }, [])

  return <Ctx.Provider value={{ settings, update }}>{children}</Ctx.Provider>
}

export function useSettings() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSettings must be used within SettingsProvider')
  return v
}
