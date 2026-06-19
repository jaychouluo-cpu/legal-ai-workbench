import { useState } from 'react'
import { s } from '../lib/style.js'
import { SettingsIcon } from '../components/icons.jsx'
import { useSettings } from '../lib/settings.jsx'
import { chatComplete } from '../lib/llm.js'

const TABS = [
  { key: 'profile', label: '个人信息', icon: SettingsIcon.profile },
  { key: 'model', label: '模型与底座', icon: SettingsIcon.model },
  { key: 'api', label: 'API 与数据接口', icon: SettingsIcon.api },
  { key: 'security', label: '数据安全', icon: SettingsIcon.security },
  { key: 'notify', label: '通知提醒', icon: SettingsIcon.notify },
]

function Switch({ on, onClick }) {
  return (
    <span onClick={onClick} style={{ ...s("width:38px;height:21px;border-radius:11px;position:relative;cursor:pointer;flex:none;transition:background .15s;"), background: on ? '#1d4ed8' : '#cbd5e1' }}>
      <span style={{ ...s("position:absolute;top:2px;width:17px;height:17px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.25);transition:left .15s;"), left: on ? '19px' : '2px' }} />
    </span>
  )
}
const H1 = (t) => <div style={s("font-family:'Noto Serif SC',serif;font-size:19px;font-weight:600;color:#16223a;margin-bottom:4px;")}>{t}</div>
const Sub = (t) => <div style={s("font-size:12.5px;color:#8b96a8;margin-bottom:20px;")}>{t}</div>

// 模型可选项（选择后写入 settings.modelName，驱动 AI 助手）
const MODEL_OPTIONS = [
  { name: '智海-录问 70B', id: 'wisdomInterrogatory', en: 'wisdomInterrogatory · 国产法律大模型', tag: '信创 · 离线', tagColor: '#15803d', tagBg: '#f0fdf4', tagBd: '#bbf7d0' },
  { name: 'LexiLaw', id: 'LexiLaw', en: 'ChatGLM 基座 · 可微调', tag: '国产', tagColor: '#1d4ed8', tagBg: '#eff4fb', tagBd: '#c7dafc' },
  { name: 'DISC-LawLLM', id: 'DISC-LawLLM', en: '复旦 · 法律问答', tag: '国产', tagColor: '#1d4ed8', tagBg: '#eff4fb', tagBd: '#c7dafc' },
  { name: '通用大模型（API）', id: 'generic', en: '需联网 · 仅非涉密场景', tag: '需授权', tagColor: '#b45309', tagBg: '#fffbeb', tagBd: '#fde68a' },
]

// 确需凭证的数据接口（保留密钥 / 账号栏）
const CRED_CONNECTORS = [
  { icon: '🏢', name: '企查查 MCP', en: 'qcc-mcp-batch', field: 'API Key', skey: 'qccKey', secret: true, note: '在线工商 / 涉诉核查需付费 API Key' },
  { icon: '🔎', name: '天眼查 MCP', en: 'tianyancha-mcp', field: 'API Key', skey: 'tycKey', secret: true, note: '可选备用企业核查数据源' },
  { icon: '📚', name: '北大法宝 MCP', en: 'pkulaw-mcp-router', field: '账号', skey: 'fabaoAccount', secret: false, note: '在线法规 / 案例增强检索需法宝账号' },
]

// 本地能力（无需任何 API / 密钥）—— 仅展示就绪状态，不提供密钥栏
const LOCAL_CAPS = [
  { icon: '🔒', name: 'presidio 脱敏', en: 'presidio + 中文规则', desc: '浏览器内运行 · 原文不出域' },
  { icon: '📄', name: 'ContractGuard 合同审查', en: '本地规则引擎', desc: '粘贴文本即审 · 无需联网' },
  { icon: '✍️', name: '文格 文书门禁', en: 'format-skill', desc: '模板填充 + 格式校验 + 导出' },
  { icon: '⏱️', name: '期限管家', en: 'period-manager', desc: '本机存储 · 日期自动计算' },
  { icon: '⚖️', name: 'cncases 离线裁判库', en: 'cncases', desc: '本地挂载路径 · 无需密钥' },
]

const PROFILE_FIELDS = [
  ['姓名', '郑明远', false], ['工号', 'LG-2087', true], ['部门', '合规部', false],
  ['职务', '高级法务', false], ['企业邮箱', 'zhengmy@corp-legal.cn', false], ['手机', '138 0013 8000', true],
]
const SECURITY_ROWS = [
  ['mask', '默认脱敏', '上传文档自动调用 presidio 识别并脱敏 PII'],
  ['noEgress', '数据不出域', '敏感数据全程内网闭环，禁止上传至外部服务'],
  ['queryOnly', '检索仅传查询要素', '调用第三方接口时不上传案件实体内容'],
  ['licenseGuard', 'license 白名单', '仅启用 ✅ 可商用能力，⚠️/❌ 项目自动隔离'],
]
const NOTIFY_ROWS = [
  ['deadlineRemind', '期限到期提醒', '举证 / 上诉 / 答辩等法定期限临近时提醒'],
  ['autoGate', '文书自动门禁', '导出前自动校验排版与法条引用规范'],
]

export default function Settings() {
  const { settings, update } = useSettings()
  const [tab, setTab] = useState('api')
  const [sw, setSw] = useState({ mask: true, noEgress: true, queryOnly: true, deadlineRemind: true, autoGate: true })
  const [remindDays, setRemindDays] = useState('7 天')
  const [test, setTest] = useState({ state: 'idle', msg: '' })
  const toggle = (k) => setSw((s0) => ({ ...s0, [k]: !s0[k] }))

  const testModel = async () => {
    if (!settings.modelEndpoint.trim()) { setTest({ state: 'err', msg: '请先填写模型 Endpoint' }); return }
    setTest({ state: 'loading', msg: '正在连接…' })
    try {
      await chatComplete(settings, [{ role: 'user', content: '你好，请回复"连接正常"。' }])
      setTest({ state: 'ok', msg: '连接成功，模型服务可用。' })
    } catch (e) {
      setTest({ state: 'err', msg: e.message })
    }
  }

  // 模型服务连接配置（Endpoint / 模型名 / API Key / 测试连接）—— 在「模型与底座」页使用
  const modelServiceBlock = () => (
    <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:16px 18px;")}>
      <div style={s("display:flex;align-items:center;gap:11px;margin-bottom:13px;")}>
        <span style={s("font-size:17px;")}>🧠</span>
        <div style={s("flex:1;min-width:0;")}>
          <div style={s("font-size:13.5px;font-weight:500;color:#16223a;")}>模型服务接口（OpenAI 兼容）</div>
          <div style={s("font-size:11px;color:#aab2c0;font-family:'IBM Plex Mono',monospace;")}>如智海-录问 / LexiLaw 私有化 /v1 · 驱动 AI 助手</div>
        </div>
        <span style={{ ...s("font-size:11.5px;padding:3px 10px;border-radius:6px;white-space:nowrap;"), color: settings.modelEndpoint ? '#15803d' : '#8b96a8', background: settings.modelEndpoint ? '#f0fdf4' : '#f3f5f9', border: `1px solid ${settings.modelEndpoint ? '#bbf7d0' : '#e3e8ef'}` }}>{settings.modelEndpoint ? '已配置' : '未配置'}</span>
      </div>
      <div style={s("display:grid;grid-template-columns:2fr 1fr;gap:10px;margin-bottom:10px;")}>
        <div>
          <div style={s("font-size:11.5px;color:#7a8699;margin-bottom:5px;")}>Endpoint（必填）</div>
          <input value={settings.modelEndpoint} onChange={(e) => update({ modelEndpoint: e.target.value })} placeholder="http://10.20.3.8:8000/v1"
            style={s("width:100%;border:1px solid #d8dfe9;border-radius:8px;padding:8px 11px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:#16223a;outline:none;background:#fbfcfe;")} className="field-input" />
        </div>
        <div>
          <div style={s("font-size:11.5px;color:#7a8699;margin-bottom:5px;")}>模型名</div>
          <input value={settings.modelName} onChange={(e) => update({ modelName: e.target.value })}
            style={s("width:100%;border:1px solid #d8dfe9;border-radius:8px;padding:8px 11px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:#16223a;outline:none;background:#fbfcfe;")} className="field-input" />
        </div>
      </div>
      <div style={s("display:flex;align-items:flex-end;gap:10px;")}>
        <div style={s("flex:1;")}>
          <div style={s("font-size:11.5px;color:#7a8699;margin-bottom:5px;")}>API Key（内网私有化通常留空）</div>
          <input value={settings.modelKey} onChange={(e) => update({ modelKey: e.target.value })} type="password" placeholder="可选"
            style={s("width:100%;border:1px solid #d8dfe9;border-radius:8px;padding:8px 11px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:#16223a;outline:none;background:#fbfcfe;")} className="field-input" />
        </div>
        <button onClick={testModel} style={s("flex:none;font-size:12.5px;color:#1d4ed8;background:#eff4fb;border:1px solid #c7dafc;padding:9px 15px;border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;")}>测试连接</button>
      </div>
      {test.state !== 'idle' && (
        <div style={{ ...s("margin-top:10px;font-size:12px;padding:8px 11px;border-radius:7px;line-height:1.5;"), color: test.state === 'ok' ? '#15803d' : test.state === 'err' ? '#b91c1c' : '#7a8699', background: test.state === 'ok' ? '#f0fdf4' : test.state === 'err' ? '#fef2f2' : '#f3f5f9', border: `1px solid ${test.state === 'ok' ? '#bbf7d0' : test.state === 'err' ? '#fecaca' : '#e3e8ef'}` }}>{test.msg}</div>
      )}
    </div>
  )

  return (
    <div style={s("display:flex;height:100%;")}>
      <div style={s("width:200px;flex:none;background:#fff;border-right:1px solid #e3e8ef;padding:18px 12px;")}>
        {TABS.map((t) => {
          const on = tab === t.key; const I = t.icon
          return (
            <a key={t.key} onClick={() => setTab(t.key)} style={{
              ...s("display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:8px;cursor:pointer;margin-bottom:4px;font-size:13px;text-decoration:none;"),
              background: on ? '#eff4fb' : 'transparent', color: on ? '#1d4ed8' : '#4a5670', fontWeight: on ? '500' : '400',
            }}><I />{t.label}</a>
          )
        })}
      </div>

      <div style={s("flex:1;min-width:0;overflow-y:auto;padding:28px 32px 48px;")}>
        <div style={s("max-width:680px;")}>

          {tab === 'profile' && (<>
            {H1('个人信息')}{Sub('用于文书落款、操作审计与通知触达')}
            <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:22px 24px;")}>
              <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:16px;")}>
                {PROFILE_FIELDS.map(([label, val, mono]) => (
                  <div key={label}>
                    <div style={s("font-size:12px;color:#7a8699;margin-bottom:6px;")}>{label}</div>
                    <input className="field-input" defaultValue={val} style={{ ...s("width:100%;border:1px solid #d8dfe9;border-radius:8px;padding:9px 12px;font-size:13.5px;color:#16223a;outline:none;"), fontFamily: mono ? "'IBM Plex Mono',monospace" : 'inherit' }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={s("display:flex;gap:10px;margin-top:18px;")}><button style={s("font-size:13px;color:#fff;background:#1d4ed8;border:none;padding:10px 22px;border-radius:9px;cursor:pointer;font-family:inherit;")}>保存修改</button></div>
          </>)}

          {tab === 'model' && (<>
            {H1('模型与底座')}{Sub('选择推理模型与部署方式 · 涉密场景建议优先国产 + 内网私有化。所选模型将用于「AI 法务助手」。')}
            <div style={s("font-size:13px;font-weight:700;color:#16223a;margin-bottom:11px;")}>推理模型</div>
            {MODEL_OPTIONS.map((m) => {
              const active = settings.modelName === m.id
              return (
                <div key={m.id} onClick={() => update({ modelName: m.id })} style={{ ...s("display:flex;align-items:center;gap:13px;background:#fff;border-radius:11px;padding:14px 16px;margin-bottom:10px;cursor:pointer;"), border: `1.5px solid ${active ? '#1d4ed8' : '#e7ebf1'}` }}>
                  <span style={{ ...s("width:18px;height:18px;flex:none;border-radius:50%;box-shadow:inset 0 0 0 3px #fff;"), border: `2px solid ${active ? '#1d4ed8' : '#cbd5e1'}`, background: active ? '#1d4ed8' : '#fff' }} />
                  <div style={s("flex:1;min-width:0;")}>
                    <div style={s("font-size:13.5px;font-weight:500;color:#16223a;")}>{m.name}</div>
                    <div style={s("font-size:11.5px;color:#aab2c0;font-family:'IBM Plex Mono',monospace;")}>{m.en}</div>
                  </div>
                  <span style={{ ...s("font-size:11px;padding:2px 9px;border-radius:6px;white-space:nowrap;"), color: m.tagColor, background: m.tagBg, border: `1px solid ${m.tagBd}` }}>{m.tag}</span>
                </div>
              )
            })}

            <div style={s("font-size:13px;font-weight:700;color:#16223a;margin:18px 0 11px;")}>模型服务接口</div>
            {modelServiceBlock()}

            <div style={s("font-size:13px;font-weight:700;color:#16223a;margin:18px 0 11px;")}>部署与底座</div>
            <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:11px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;")}>
              <div><div style={s("font-size:13px;color:#16223a;")}>本地知识库</div><div style={s("font-size:11.5px;color:#aab2c0;margin-top:2px;")}>ragflow · 内部范本 / 合同私有问答（部署后启用）</div></div>
              <span style={s("font-size:11.5px;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:4px 10px;border-radius:6px;")}>本地</span>
            </div>
          </>)}

          {tab === 'api' && (<>
            {H1('API 与数据接口')}{Sub('仅「确需外部服务」的能力需要配置；本地能力无需任何密钥。密钥仅存于本机浏览器，不随请求出域。')}

            {/* 模型服务：在「模型与底座」页配置，此处仅显示状态并跳转 */}
            <div style={s("font-size:12.5px;font-weight:700;color:#16223a;margin-bottom:10px;")}>模型服务（驱动 AI 助手）</div>
            <div onClick={() => setTab('model')} style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:14px 18px;margin-bottom:18px;display:flex;align-items:center;gap:11px;cursor:pointer;")}>
              <span style={s("font-size:17px;")}>🧠</span>
              <div style={s("flex:1;min-width:0;")}>
                <div style={s("font-size:13.5px;font-weight:500;color:#16223a;")}>模型服务接口</div>
                <div style={s("font-size:11px;color:#aab2c0;font-family:'IBM Plex Mono',monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{settings.modelEndpoint || '未配置 · 前往「模型与底座」填写 Endpoint'}</div>
              </div>
              <span style={{ ...s("font-size:11.5px;padding:3px 10px;border-radius:6px;white-space:nowrap;"), color: settings.modelEndpoint ? '#15803d' : '#8b96a8', background: settings.modelEndpoint ? '#f0fdf4' : '#f3f5f9', border: `1px solid ${settings.modelEndpoint ? '#bbf7d0' : '#e3e8ef'}` }}>{settings.modelEndpoint ? '已配置' : '未配置'}</span>
              <span style={s("font-size:12px;color:#1d4ed8;white-space:nowrap;")}>去配置 →</span>
            </div>

            {/* 数据接口（需凭证） */}
            <div style={s("font-size:12.5px;font-weight:700;color:#16223a;margin-bottom:10px;")}>数据接口（确需凭证）</div>
            {CRED_CONNECTORS.map((c) => (
              <div key={c.skey} style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:16px 18px;margin-bottom:12px;")}>
                <div style={s("display:flex;align-items:center;gap:11px;margin-bottom:11px;")}>
                  <span style={s("font-size:17px;")}>{c.icon}</span>
                  <div style={s("flex:1;min-width:0;")}>
                    <div style={s("font-size:13.5px;font-weight:500;color:#16223a;")}>{c.name}</div>
                    <div style={s("font-size:11px;color:#aab2c0;")}>{c.note}</div>
                  </div>
                  <span style={{ ...s("font-size:11.5px;padding:3px 10px;border-radius:6px;white-space:nowrap;"), color: settings[c.skey] ? '#15803d' : '#8b96a8', background: settings[c.skey] ? '#f0fdf4' : '#f3f5f9', border: `1px solid ${settings[c.skey] ? '#bbf7d0' : '#e3e8ef'}` }}>{settings[c.skey] ? '已配置' : '未配置'}</span>
                </div>
                <div style={s("display:flex;align-items:flex-end;gap:10px;")}>
                  <div style={s("flex:1;min-width:0;")}>
                    <div style={s("font-size:11.5px;color:#7a8699;margin-bottom:5px;")}>{c.field}</div>
                    <input value={settings[c.skey]} onChange={(e) => update({ [c.skey]: e.target.value })} type={c.secret ? 'password' : 'text'} placeholder="请输入"
                      style={s("width:100%;border:1px solid #d8dfe9;border-radius:8px;padding:8px 11px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:#16223a;outline:none;background:#fbfcfe;")} className="field-input" />
                  </div>
                </div>
              </div>
            ))}

            {/* 本地能力（无需密钥）—— 不提供任何 API/Key 栏 */}
            <div style={s("font-size:12.5px;font-weight:700;color:#16223a;margin:18px 0 10px;")}>本地能力（无需密钥 / 接口）</div>
            <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;overflow:hidden;")}>
              {LOCAL_CAPS.map((c, i) => (
                <div key={c.en} style={{ ...s("display:flex;align-items:center;gap:11px;padding:13px 18px;"), borderBottom: i < LOCAL_CAPS.length - 1 ? '1px solid #f0f2f6' : 'none' }}>
                  <span style={s("font-size:16px;")}>{c.icon}</span>
                  <div style={s("flex:1;min-width:0;")}>
                    <div style={s("font-size:13px;color:#16223a;")}>{c.name} <span style={s("font-size:10.5px;color:#aab2c0;font-family:'IBM Plex Mono',monospace;")}>· {c.en}</span></div>
                    <div style={s("font-size:11px;color:#aab2c0;margin-top:1px;")}>{c.desc}</div>
                  </div>
                  <span style={s("font-size:11.5px;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:3px 10px;border-radius:6px;white-space:nowrap;")}>已就绪 · 本地</span>
                </div>
              ))}
            </div>
            <div style={s("margin-top:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 15px;display:flex;gap:10px;")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" style={{ flex: 'none', marginTop: '1px' }}><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
              <div style={s("font-size:12px;color:#2a5a3c;line-height:1.65;")}>本地能力不调用任何外部接口，已取消其密钥栏。仅 ✅ 可商用接口纳入业务流程；调用第三方检索接口时只传必要查询要素，案件实体内容不上传。</div>
            </div>
          </>)}

          {tab === 'security' && (<>
            {H1('数据安全')}{Sub('落地两条红线：数据不出域、license 白名单')}
            <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;overflow:hidden;")}>
              {SECURITY_ROWS.map(([k, title, desc], i) => (
                <div key={k} style={{ ...s("display:flex;align-items:center;gap:14px;padding:16px 20px;"), borderBottom: i < SECURITY_ROWS.length - 1 ? '1px solid #f0f2f6' : 'none' }}>
                  <div style={s("flex:1;")}><div style={s("font-size:13.5px;color:#16223a;")}>{title}</div><div style={s("font-size:11.5px;color:#aab2c0;margin-top:2px;")}>{desc}</div></div>
                  <Switch on={sw[k]} onClick={() => toggle(k)} />
                </div>
              ))}
            </div>
          </>)}

          {tab === 'notify' && (<>
            {H1('通知提醒')}{Sub('期限与待办的提醒方式')}
            <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;overflow:hidden;")}>
              {NOTIFY_ROWS.map(([k, title, desc]) => (
                <div key={k} style={s("display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid #f0f2f6;")}>
                  <div style={s("flex:1;")}><div style={s("font-size:13.5px;color:#16223a;")}>{title}</div><div style={s("font-size:11.5px;color:#aab2c0;margin-top:2px;")}>{desc}</div></div>
                  <Switch on={sw[k]} onClick={() => toggle(k)} />
                </div>
              ))}
              <div style={s("display:flex;align-items:center;gap:14px;padding:16px 20px;")}>
                <div style={s("flex:1;")}><div style={s("font-size:13.5px;color:#16223a;")}>提前提醒天数</div><div style={s("font-size:11.5px;color:#aab2c0;margin-top:2px;")}>距到期日多少天开始提醒</div></div>
                <div style={s("display:flex;gap:6px;")}>
                  {['3 天', '7 天', '15 天'].map((d) => {
                    const on = remindDays === d
                    return <span key={d} onClick={() => setRemindDays(d)} style={{ ...s("font-size:12px;padding:6px 12px;border-radius:7px;cursor:pointer;"), color: on ? '#fff' : '#7a8699', background: on ? '#1d4ed8' : '#f3f5f9', border: on ? 'none' : '1px solid #e3e8ef' }}>{d}</span>
                  })}
                </div>
              </div>
            </div>
          </>)}

        </div>
      </div>
    </div>
  )
}
