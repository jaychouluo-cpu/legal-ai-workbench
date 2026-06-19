import { s } from '../lib/style.js'
import { Icon } from './icons.jsx'

const NAV = [
  { group: '总览', items: [
    { key: 'home', label: '工作台', icon: Icon.home },
    { key: 'agent', label: 'AI 法务助手', icon: Icon.agent },
  ]},
  { group: '业务能力', items: [
    { key: 'contract', label: '合同审查 · 红线', icon: Icon.contract },
    { key: 'retrieval', label: '法规 · 案例检索', icon: Icon.retrieval },
    { key: 'entity', label: '企业核查 · 尽调', icon: Icon.entity },
    { key: 'desensitize', label: '数据脱敏 · 合规', icon: Icon.desensitize },
    { key: 'docgen', label: '文书生成 · 文格', icon: Icon.docgen },
    { key: 'deadline', label: '期限管家 · 台账', icon: Icon.deadline },
  ]},
  { group: '系统', items: [
    { key: 'settings', label: '设置', icon: Icon.settings },
  ]},
]

export default function Sidebar({ view, onNavigate }) {
  return (
    <aside style={s("width:236px;flex:none;background:linear-gradient(180deg,#0e1f3d 0%,#0b1830 100%);display:flex;flex-direction:column;color:#fff;")}>
      <div style={s("padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,0.08);")}>
        <div style={s("display:flex;align-items:center;gap:11px;")}>
          <div style={s("width:34px;height:34px;flex:none;border-radius:8px;background:linear-gradient(135deg,#3b6fd4,#1d4ed8);display:flex;align-items:center;justify-content:center;font-family:'Noto Serif SC',serif;font-weight:700;font-size:18px;color:#fff;")}>法</div>
          <div>
            <div style={s("font-family:'Noto Serif SC',serif;font-weight:700;font-size:16px;letter-spacing:0.5px;line-height:1.1;")}>法务智库</div>
            <div style={s("font-size:10.5px;color:#7e8fb0;letter-spacing:1.5px;margin-top:2px;")}>LEGAL AI TOOLBOX</div>
          </div>
        </div>
      </div>

      <nav style={s("flex:1;overflow-y:auto;padding:12px 12px 8px;")}>
        {NAV.map((sec) => (
          <div key={sec.group}>
            <div style={s("font-size:10.5px;color:#5d6f93;letter-spacing:1.5px;padding:14px 10px 6px;")}>{sec.group}</div>
            {sec.items.map((it) => {
              const active = view === it.key
              const I = it.icon
              return (
                <a key={it.key} onClick={() => onNavigate(it.key)} style={{
                  ...s("display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:7px;cursor:pointer;margin-bottom:3px;font-size:13.5px;text-decoration:none;"),
                  borderLeft: `3px solid ${active ? '#7aa7e9' : 'transparent'}`,
                  background: active ? 'rgba(122,167,233,0.16)' : 'transparent',
                  color: active ? '#ffffff' : '#a7b5d1',
                }}>
                  <I /><span>{it.label}</span>
                </a>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={s("padding:13px 16px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:#7e8fb0;line-height:1.7;")}>
        <div style={s("display:flex;align-items:center;gap:6px;")}><span style={s("width:7px;height:7px;border-radius:50%;background:#3ec98a;flex:none;")} />内网私有化运行</div>
        <div style={s("margin-top:3px;color:#5d6f93;")}>国产模型 · 智海-录问 70B</div>
      </div>
    </aside>
  )
}
