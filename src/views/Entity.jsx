import { useState, useMemo } from 'react'
import { s } from '../lib/style.js'
import { ENTITY_FIELDS, assessEntity } from '../engine/entity.js'
import { useSettings } from '../lib/settings.jsx'

function initVals() {
  const v = {}
  for (const f of ENTITY_FIELDS) v[f.k] = f.def
  return v
}

export default function Entity({ navigate }) {
  const [vals, setVals] = useState(initVals)
  const { settings } = useSettings()
  const hasQcc = !!(settings.qccKey && settings.qccKey.trim())
  const result = useMemo(() => assessEntity(vals), [vals])

  const set = (k, val) => setVals((v) => ({ ...v, [k]: val }))

  // 派生风险卡（由录入指标生成）
  const risks = [
    { label: '失信被执行', val: vals.dishonest ? '是' : '否', color: vals.dishonest ? '#b91c1c' : '#15803d', bg: vals.dishonest ? '#fef2f2' : '#f0fdf4', bd: vals.dishonest ? '#fecaca' : '#bbf7d0' },
    { label: '重大未决诉讼', val: vals.majorSuit ? '是' : '否', color: vals.majorSuit ? '#b91c1c' : '#15803d', bg: vals.majorSuit ? '#fef2f2' : '#f0fdf4', bd: vals.majorSuit ? '#fecaca' : '#bbf7d0' },
    { label: '行政处罚', val: String(vals.penalties), color: vals.penalties > 2 ? '#b91c1c' : vals.penalties > 0 ? '#b45309' : '#15803d', bg: vals.penalties > 2 ? '#fef2f2' : vals.penalties > 0 ? '#fffbeb' : '#f0fdf4', bd: vals.penalties > 2 ? '#fecaca' : vals.penalties > 0 ? '#fde68a' : '#bbf7d0' },
    { label: '经营异常(未移出)', val: String(vals.abnormal), color: vals.abnormal > 0 ? '#b45309' : '#15803d', bg: vals.abnormal > 0 ? '#fffbeb' : '#f0fdf4', bd: vals.abnormal > 0 ? '#fde68a' : '#bbf7d0' },
  ]

  return (
    <div style={s("padding:24px 32px 40px;max-width:1040px;margin:0 auto;")}>
      {/* 头部 */}
      <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:13px;padding:20px 24px;margin-bottom:18px;")}>
        <div style={s("display:flex;align-items:center;gap:16px;")}>
          <div style={s("width:48px;height:48px;flex:none;border-radius:11px;background:#fef7ed;color:#b45309;display:flex;align-items:center;justify-content:center;")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></svg>
          </div>
          <input value={vals.name} onChange={(e) => set('name', e.target.value)} placeholder="输入企业名称"
            style={s("flex:1;font-family:'Noto Serif SC',serif;font-size:20px;font-weight:600;color:#16223a;border:none;outline:none;border-bottom:1px solid transparent;background:transparent;")} className="field-input" />
          <span style={{ ...s("flex:none;font-size:11px;padding:4px 9px;border-radius:6px;font-family:'IBM Plex Mono',monospace;white-space:nowrap;"), color: hasQcc ? '#15803d' : '#b45309', background: hasQcc ? '#f0fdf4' : '#fffbeb', border: `1px solid ${hasQcc ? '#bbf7d0' : '#fde68a'}` }}>
            {hasQcc ? '企查查 MCP · 已配置' : '在线查询未配置'}
          </span>
        </div>
        {!hasQcc && (
          <div style={s("margin-top:12px;font-size:12px;color:#92660e;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:9px 12px;line-height:1.6;")}>
            真实工商 / 涉诉数据需在「设置 · API 与数据接口」配置企查查 API Key。当前为<b>手动录入 + 本地规则评估</b>模式，下方录入指标即可得出准入结论。
          </div>
        )}
      </div>

      <div style={s("display:grid;grid-template-columns:1.5fr 1fr;gap:18px;")}>
        {/* 录入 + 风险卡 */}
        <div>
          <div style={s("font-size:13px;font-weight:700;color:#16223a;margin-bottom:12px;")}>风险指标录入</div>
          <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:8px 16px;margin-bottom:16px;")}>
            {ENTITY_FIELDS.filter((f) => f.k !== 'name').map((f) => (
              <div key={f.k} style={s("display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid #f0f2f6;")}>
                <div style={s("font-size:13px;color:#4a5670;")}>{f.label}</div>
                {f.type === 'bool' ? (
                  <span onClick={() => set(f.k, !vals[f.k])} style={{ ...s("width:38px;height:21px;border-radius:11px;position:relative;cursor:pointer;flex:none;transition:background .15s;"), background: vals[f.k] ? '#b91c1c' : '#cbd5e1' }}>
                    <span style={{ ...s("position:absolute;top:2px;width:17px;height:17px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.25);transition:left .15s;"), left: vals[f.k] ? '19px' : '2px' }} />
                  </span>
                ) : (
                  <input type="number" min="0" value={vals[f.k]} onChange={(e) => set(f.k, Number(e.target.value))}
                    style={s("width:64px;border:1px solid #d8dfe9;border-radius:7px;padding:6px 9px;font-family:'IBM Plex Mono',monospace;font-size:13px;color:#16223a;outline:none;text-align:center;")} className="field-input" />
                )}
              </div>
            ))}
          </div>
          <div style={s("display:grid;grid-template-columns:repeat(2,1fr);gap:12px;")}>
            {risks.map((r, i) => (
              <div key={i} style={{ ...s("border-radius:11px;padding:14px;"), background: r.bg, border: `1px solid ${r.bd}` }}>
                <div style={s("font-size:12px;color:#7a8699;")}>{r.label}</div>
                <div style={{ ...s("font-family:'IBM Plex Mono',monospace;font-size:24px;font-weight:600;margin-top:3px;line-height:1;"), color: r.color }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 准入结论 */}
        <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:13px;padding:18px 20px;")}>
          <div style={s("font-size:13px;font-weight:700;color:#16223a;margin-bottom:4px;")}>供应商准入对照</div>
          <div style={{ ...s("display:flex;align-items:center;gap:9px;margin:10px 0 16px;padding:11px 13px;border-radius:9px;"), background: result.bg, border: `1px solid ${result.bd}` }}>
            <span style={{ ...s("font-size:12px;font-weight:700;background:#fff;padding:3px 9px;border-radius:6px;"), color: result.color, border: `1px solid ${result.bd}` }}>{result.verdict}</span>
            <span style={{ ...s("font-size:12px;line-height:1.5;"), color: result.color }}>
              {result.verdict === '附条件准入' ? '建议补充履约担保后准入' : result.verdict === '不予准入' ? '命中一票否决项' : '符合准入标准'}
            </span>
          </div>
          {result.criteria.map((c, i) => (
            <div key={i} style={s("display:flex;align-items:flex-start;gap:9px;padding:8px 0;border-bottom:1px solid #f0f2f6;")}>
              <span style={{ ...s("width:7px;height:7px;flex:none;border-radius:50%;margin-top:6px;"), background: c.ok ? '#15803d' : '#b45309' }} />
              <div style={s("flex:1;font-size:12.5px;color:#4a5670;line-height:1.5;")}>{c.text}</div>
            </div>
          ))}
          <button onClick={() => navigate('docgen')} style={s("width:100%;margin-top:14px;font-size:13px;color:#fff;background:#1d4ed8;border:none;padding:10px 0;border-radius:9px;cursor:pointer;font-family:inherit;")}>生成供应商准入意见书</button>
        </div>
      </div>
    </div>
  )
}
