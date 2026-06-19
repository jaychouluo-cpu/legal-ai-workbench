import { useState, useRef, useEffect } from 'react'
import { s } from '../lib/style.js'
import { Icon } from '../components/icons.jsx'
import { mounted as mountedData } from '../data.js'
import { useSettings } from '../lib/settings.jsx'
import { hasModel, chatComplete, SYSTEM_PROMPT } from '../lib/llm.js'

const DEMO_REPLY =
  '【演示模式】未配置模型服务，无法进行真实推理。请在「设置 · API 与数据接口」填写模型 Endpoint' +
  '（如智海-录问私有化部署的 http://host:port/v1）后重试。正式回复将依据中国法律法规给出附出处的建议，' +
  '并由法务复核。'

export default function Agent({ navigate }) {
  const { settings } = useSettings()
  const online = hasModel(settings)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const [caps, setCaps] = useState(() => mountedData.map((c) => ({ ...c })))
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  const send = async () => {
    const t = chatInput.trim()
    if (!t || busy) return
    const history = [...messages, { role: 'user', text: t }]
    setMessages(history)
    setChatInput('')
    if (!online) {
      setTimeout(() => setMessages((m) => [...m, { role: 'assistant', text: DEMO_REPLY }]), 400)
      return
    }
    setBusy(true)
    try {
      const apiMsgs = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map((m) => ({ role: m.role, content: m.text })),
      ]
      const reply = await chatComplete(settings, apiMsgs)
      setMessages((m) => [...m, { role: 'assistant', text: reply }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: `调用模型服务失败：${err.message}。请在「设置」中检查 Endpoint 与网络连通性。` }])
    } finally {
      setBusy(false)
    }
  }
  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
  const toggleCap = (i) => setCaps((cs) => cs.map((c, idx) => (idx === i ? { ...c, on: !c.on } : c)))

  return (
    <div style={s("display:flex;height:100%;")}>
      <div style={s("flex:1;display:flex;flex-direction:column;min-width:0;")}>
        <div style={s("flex:1;overflow-y:auto;padding:24px 0;")}>
          <div style={s("max-width:760px;margin:0 auto;padding:0 28px;")}>

            {/* 状态条 */}
            <div style={{ ...s("display:flex;align-items:center;gap:8px;font-size:11.5px;padding:8px 12px;border-radius:9px;margin-bottom:18px;"), color: online ? '#15803d' : '#b45309', background: online ? '#f0fdf4' : '#fffbeb', border: `1px solid ${online ? '#bbf7d0' : '#fde68a'}` }}>
              <span style={{ ...s("width:7px;height:7px;border-radius:50%;flex:none;"), background: online ? '#3ec98a' : '#f0a020' }} />
              {online
                ? <>已连接模型服务：{settings.modelName} · {settings.modelEndpoint}（内网推理 · 数据不出域）</>
                : <>演示模式 · 未配置模型服务。前往「设置 · API 与数据接口」填写 Endpoint 即可真实对话。</>}
            </div>

            {messages.length === 0 && (
              <div style={s("text-align:center;color:#aab2c0;font-size:13px;padding:40px 0;line-height:1.9;")}>
                试着提问，例如：<br />
                <span style={s("color:#7a8699;")}>「竞业限制经济补偿没约定标准怎么处理？」</span><br />
                <span style={s("color:#7a8699;")}>「合同里违约金约定30%有什么风险？」</span>
              </div>
            )}

            {messages.map((m, i) => (
              m.role === 'user' ? (
                <div key={i} style={s("display:flex;gap:13px;margin-bottom:20px;justify-content:flex-end;")}>
                  <div style={s("max-width:75%;background:#1d4ed8;color:#fff;padding:12px 15px;border-radius:13px 13px 3px 13px;font-size:13.5px;line-height:1.7;")}>{m.text}</div>
                  <div style={s("width:32px;height:32px;flex:none;border-radius:50%;background:#dde6f4;color:#1d4ed8;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;")}>郑</div>
                </div>
              ) : (
                <div key={i} style={s("display:flex;gap:13px;margin-bottom:20px;")}>
                  <div style={s("width:32px;height:32px;flex:none;border-radius:8px;background:linear-gradient(135deg,#3b6fd4,#1d4ed8);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Noto Serif SC',serif;font-weight:700;font-size:15px;")}>法</div>
                  <div style={s("flex:1;min-width:0;background:#fff;border:1px solid #e7ebf1;border-radius:13px 13px 13px 3px;padding:14px 17px;font-size:13.5px;line-height:1.85;color:#2a3650;white-space:pre-wrap;word-break:break-word;")}>{m.text}</div>
                </div>
              )
            ))}

            {busy && (
              <div style={s("display:flex;gap:13px;margin-bottom:20px;")}>
                <div style={s("width:32px;height:32px;flex:none;border-radius:8px;background:linear-gradient(135deg,#3b6fd4,#1d4ed8);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Noto Serif SC',serif;font-weight:700;font-size:15px;")}>法</div>
                <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:13px;padding:14px 17px;font-size:13px;color:#8b96a8;")}>推理中…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* 输入区 */}
        <div style={s("flex:none;padding:14px 28px 20px;background:linear-gradient(180deg,rgba(238,241,245,0),#eef1f5 40%);")}>
          <div style={s("max-width:760px;margin:0 auto;")}>
            <div style={s("background:#fff;border:1px solid #d8dfe9;border-radius:14px;padding:10px 12px 8px;box-shadow:0 4px 16px rgba(20,34,58,0.06);")}>
              <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={onKey}
                placeholder="输入法律问题，Enter 发送（Shift+Enter 换行）" rows={2}
                style={s("width:100%;border:none;outline:none;resize:none;font-family:inherit;font-size:13.5px;line-height:1.6;color:#16223a;background:transparent;")} />
              <div style={s("display:flex;align-items:center;gap:7px;padding-top:6px;border-top:1px solid #f0f2f6;")}>
                <span style={s("font-size:11.5px;color:#1d4ed8;background:#eff4fb;border:1px solid #c7dafc;padding:3px 9px;border-radius:6px;")}>@合同审查</span>
                <span style={s("font-size:11.5px;color:#7a8699;background:#f3f5f9;border:1px solid #e3e8ef;padding:3px 9px;border-radius:6px;")}>@法规检索</span>
                <div style={s("flex:1;")} />
                <span style={s("font-size:11px;color:#aab2c0;")}>内网处理 · 不出域</span>
                <button onClick={send} disabled={busy} style={{ ...s("width:34px;height:34px;border:none;border-radius:9px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;"), background: busy ? '#9db5e8' : '#1d4ed8' }}><Icon.send /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：已挂载能力 */}
      <div style={s("width:248px;flex:none;background:#fff;border-left:1px solid #e3e8ef;padding:20px 18px;overflow-y:auto;")}>
        <div style={s("font-size:12px;font-weight:700;color:#16223a;margin-bottom:4px;")}>已挂载能力</div>
        <div style={s("font-size:11px;color:#aab2c0;margin-bottom:14px;")}>一壳多挂 · 按需启停</div>
        {caps.map((c, i) => (
          <div key={c.id} style={s("display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f0f2f6;")}>
            <div style={{ ...s("width:30px;height:30px;flex:none;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;"), background: c.bg, color: c.color }}>{c.emoji}</div>
            <div style={s("flex:1;min-width:0;")}>
              <div style={s("font-size:12.5px;color:#16223a;")}>{c.name}</div>
              <div style={s("font-size:10.5px;color:#aab2c0;font-family:'IBM Plex Mono',monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{c.id}</div>
            </div>
            <span onClick={() => toggleCap(i)} style={{ ...s("width:30px;height:17px;border-radius:10px;position:relative;flex:none;cursor:pointer;transition:background .15s;"), background: c.on ? '#1d4ed8' : '#cbd5e1' }}>
              <span style={{ ...s("position:absolute;top:2px;width:13px;height:13px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,0.2);transition:left .15s;"), left: c.on ? '15px' : '2px' }} />
            </span>
          </div>
        ))}
        <div style={s("margin-top:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:9px;padding:11px 13px;")}>
          <div style={s("font-size:11.5px;font-weight:700;color:#15803d;margin-bottom:3px;")}>license 白名单</div>
          <div style={s("font-size:11px;color:#3a7a52;line-height:1.6;")}>当前会话仅启用 ✅ 可商用能力；⚠️/❌ 项目已隔离。</div>
        </div>
        <button onClick={() => navigate('settings')} style={s("width:100%;margin-top:12px;font-size:12px;color:#1d4ed8;background:#eff4fb;border:1px solid #c7dafc;padding:8px 0;border-radius:8px;cursor:pointer;font-family:inherit;")}>配置模型服务 →</button>
      </div>
    </div>
  )
}
