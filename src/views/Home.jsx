import { s } from '../lib/style.js'
import { Icon } from '../components/icons.jsx'
import { modules, recent, architectureLayers } from '../data.js'

const STATS = [
  { label: '本月已审合同', val: '128', unit: ' 份', color: '#16223a', sub: '↑ 较上月 +22%', subColor: '#15803d' },
  { label: '识别高风险条款', val: '37', unit: ' 处', color: '#b91c1c', sub: '已全部生成红线建议', subColor: '#8b96a8' },
  { label: '企业核查 / 尽调', val: '54', unit: ' 家', color: '#16223a', sub: '2 家命中准入红线', subColor: '#8b96a8' },
  { label: '临期事项', val: '3', unit: ' 项', color: '#b45309', sub: '最近一项 2 天后到期', subColor: '#b45309' },
]

export default function Home({ navigate }) {
  return (
    <div style={s("padding:28px 32px 48px;max-width:1180px;")}>
      <div style={s("display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:22px;")}>
        <div>
          <div style={s("font-family:'Noto Serif SC',serif;font-size:25px;font-weight:600;color:#16223a;")}>下午好，郑明远</div>
          <div style={s("font-size:13.5px;color:#8b96a8;margin-top:5px;")}>2026年6月19日 · 周五 · 本周你有 <b style={s("color:#b45309;")}>3 项</b>临期事项待处理</div>
        </div>
        <button onClick={() => navigate('agent')} style={s("display:inline-flex;align-items:center;gap:8px;background:#1d4ed8;color:#fff;border:none;padding:11px 18px;border-radius:9px;font-size:13.5px;font-weight:500;cursor:pointer;box-shadow:0 4px 12px rgba(29,78,216,0.25);font-family:inherit;")}>
          <Icon.spark />向 AI 助手提问
        </button>
      </div>

      {/* 统计行 */}
      <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:26px;")}>
        {STATS.map((st) => (
          <div key={st.label} style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:18px 18px 16px;")}>
            <div style={s("font-size:12.5px;color:#8b96a8;")}>{st.label}</div>
            <div style={{ ...s("font-family:'IBM Plex Mono',monospace;font-size:30px;font-weight:600;margin-top:4px;"), color: st.color }}>
              {st.val}<span style={s("font-size:14px;color:#8b96a8;font-family:inherit;")}>{st.unit}</span>
            </div>
            <div style={{ ...s("font-size:11.5px;margin-top:4px;"), color: st.subColor }}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* 能力工作区 */}
      <div style={s("font-size:13px;font-weight:700;color:#16223a;margin-bottom:13px;letter-spacing:0.5px;")}>能力工作区</div>
      <div style={s("display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px;")}>
        {modules.map((m) => (
          <div key={m.key} className="module-card" onClick={() => navigate(m.key)} style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:18px;cursor:pointer;")}>
            <div style={s("display:flex;align-items:center;gap:11px;margin-bottom:11px;")}>
              <div style={{ ...s("width:38px;height:38px;flex:none;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px;"), background: m.iconBg, color: m.iconColor }}>{m.emoji}</div>
              <div>
                <div style={s("font-size:14.5px;font-weight:500;color:#16223a;")}>{m.name}</div>
                <div style={s("font-size:11px;color:#aab2c0;font-family:'IBM Plex Mono',monospace;")}>{m.en}</div>
              </div>
            </div>
            <div style={s("font-size:12.5px;color:#7a8699;line-height:1.6;min-height:38px;")}>{m.desc}</div>
            <div style={s("margin-top:10px;font-size:11.5px;color:#1d4ed8;font-weight:500;")}>进入工作区 →</div>
          </div>
        ))}
      </div>

      {/* 最近处理 + 四层架构 */}
      <div style={s("display:grid;grid-template-columns:1.4fr 1fr;gap:16px;")}>
        <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:18px 20px;")}>
          <div style={s("font-size:13px;font-weight:700;color:#16223a;margin-bottom:6px;")}>最近处理</div>
          {recent.map((r, i) => (
            <div key={i} style={s("display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #f0f2f6;")}>
              <div style={{ ...s("width:30px;height:30px;flex:none;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;"), background: r.bg, color: r.color }}>{r.emoji}</div>
              <div style={s("flex:1;min-width:0;")}>
                <div style={s("font-size:13px;color:#16223a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{r.title}</div>
                <div style={s("font-size:11px;color:#aab2c0;margin-top:1px;")}>{r.meta}</div>
              </div>
              <div style={{ ...s("font-size:11.5px;padding:3px 9px;border-radius:20px;white-space:nowrap;"), color: r.color, background: r.bg }}>{r.tag}</div>
            </div>
          ))}
        </div>

        {/* 分层架构（取自整合方案 4. 分层架构）*/}
        <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:18px 20px;")}>
          <div style={s("font-size:13px;font-weight:700;color:#16223a;margin-bottom:3px;")}>工具箱分层架构</div>
          <div style={s("font-size:11px;color:#aab2c0;margin-bottom:12px;")}>一壳多挂 · 逐层可替换 · 可私有化</div>
          {architectureLayers.map((l) => (
            <div key={l.tag} style={s("display:flex;gap:11px;padding:9px 0;border-bottom:1px solid #f0f2f6;")}>
              <span style={{ ...s("flex:none;width:30px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;"), color: l.color, background: l.bg, border: `1px solid ${l.bd}` }}>{l.tag}</span>
              <div style={s("flex:1;min-width:0;")}>
                <div style={s("font-size:12.5px;color:#16223a;font-weight:500;")}>{l.name} <span style={s("font-size:11px;color:#aab2c0;font-weight:400;")}>· {l.desc}</span></div>
                <div style={s("font-size:11px;color:#8b96a8;line-height:1.55;margin-top:2px;")}>{l.items}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
