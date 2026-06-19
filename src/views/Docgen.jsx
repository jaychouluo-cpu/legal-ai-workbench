import { useState, useMemo } from 'react'
import { s } from '../lib/style.js'
import { TEMPLATES, renderText, exportDoc, gateCheck } from '../engine/docgen.js'

function initValues(tpl) {
  const v = {}
  for (const f of tpl.fields) v[f.k] = f.def
  return v
}

export default function Docgen() {
  const [selIdx, setSelIdx] = useState(0)
  const tpl = TEMPLATES[selIdx]
  const [valuesByTpl, setValuesByTpl] = useState(() => TEMPLATES.map(initValues))
  const values = valuesByTpl[selIdx]

  const setVal = (k, val) => setValuesByTpl((all) => all.map((v, i) => (i === selIdx ? { ...v, [k]: val } : v)))

  const paragraphs = useMemo(() => tpl.build(values), [tpl, values])
  const text = useMemo(() => renderText(tpl, values), [tpl, values])
  const gate = useMemo(() => gateCheck(text, values), [text, values])

  return (
    <div style={s("display:flex;height:100%;")}>
      {/* 模板 + 字段 */}
      <div style={s("width:288px;flex:none;background:#fff;border-right:1px solid #e3e8ef;padding:18px 16px;overflow-y:auto;")}>
        <div style={s("font-size:13px;font-weight:700;color:#16223a;margin-bottom:4px;")}>文书模板</div>
        <div style={s("font-size:11px;color:#aab2c0;margin-bottom:12px;")}>文格 · 模板库（本地）</div>
        {TEMPLATES.map((t, i) => {
          const on = i === selIdx
          return (
            <div key={t.key} onClick={() => setSelIdx(i)} style={{
              ...s("display:flex;align-items:center;gap:10px;padding:10px 11px;border-radius:9px;margin-bottom:7px;cursor:pointer;"),
              border: `1px solid ${on ? '#1d4ed8' : '#e7ebf1'}`, background: on ? '#eff4fb' : '#fff',
            }}>
              <span style={s("font-size:16px;")}>{t.emoji}</span>
              <div style={s("flex:1;min-width:0;")}>
                <div style={s("font-size:13px;color:#16223a;")}>{t.name}</div>
                <div style={s("font-size:10.5px;color:#aab2c0;")}>{t.cat}</div>
              </div>
            </div>
          )
        })}

        <div style={s("font-size:12px;font-weight:700;color:#16223a;margin:16px 0 10px;")}>填写字段</div>
        {tpl.fields.map((f) => (
          <div key={f.k} style={s("margin-bottom:11px;")}>
            <div style={s("font-size:11.5px;color:#7a8699;margin-bottom:5px;")}>{f.label}</div>
            {f.type === 'textarea' ? (
              <textarea value={values[f.k]} onChange={(e) => setVal(f.k, e.target.value)} rows={3}
                style={s("width:100%;border:1px solid #d8dfe9;border-radius:8px;padding:8px 10px;font-family:inherit;font-size:12.5px;color:#16223a;outline:none;resize:vertical;")} className="field-input" />
            ) : f.type === 'select' ? (
              <select value={values[f.k]} onChange={(e) => setVal(f.k, e.target.value)}
                style={s("width:100%;border:1px solid #d8dfe9;border-radius:8px;padding:8px 10px;font-family:inherit;font-size:12.5px;color:#16223a;outline:none;background:#fff;")}>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input value={values[f.k]} onChange={(e) => setVal(f.k, e.target.value)}
                style={s("width:100%;border:1px solid #d8dfe9;border-radius:8px;padding:8px 10px;font-family:inherit;font-size:12.5px;color:#16223a;outline:none;")} className="field-input" />
            )}
          </div>
        ))}
      </div>

      {/* 预览 */}
      <div style={s("flex:1;min-width:0;display:flex;flex-direction:column;background:#eef1f5;")}>
        <div style={s("flex:none;display:flex;align-items:center;gap:12px;padding:14px 24px;background:#fff;border-bottom:1px solid #e3e8ef;")}>
          <div style={s("flex:1;min-width:0;font-size:14px;font-weight:500;color:#16223a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{tpl.name} — 实时预览</div>
          <button onClick={() => navigator.clipboard?.writeText(text)} style={s("flex:none;font-size:12.5px;color:#16223a;background:#fff;border:1px solid #d8dfe9;padding:7px 13px;border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;")}>复制全文</button>
          <button onClick={() => exportDoc(tpl, values)} style={s("flex:none;font-size:12.5px;color:#fff;background:#1d4ed8;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;")}>导出 Word</button>
        </div>
        <div style={s("flex:1;overflow-y:auto;padding:26px;")}>
          <div style={s("max-width:640px;margin:0 auto;background:#fff;border:1px solid #e7ebf1;border-radius:6px;padding:48px 56px;font-size:13.5px;line-height:2;color:#2a3650;box-shadow:0 2px 14px rgba(20,34,58,0.05);")}>
            <div style={s("text-align:center;font-family:'Noto Serif SC',serif;font-size:19px;font-weight:600;color:#16223a;margin-bottom:4px;")}>{tpl.name}</div>
            <div style={s("text-align:center;font-size:12px;color:#aab2c0;margin-bottom:24px;font-family:'IBM Plex Mono',monospace;")}>{tpl.docNo}</div>
            {paragraphs.map((p, i) => (
              p.h
                ? <p key={i} style={s("margin:16px 0 6px;font-weight:700;color:#16223a;")}>{p.t}</p>
                : <p key={i} style={s("margin:0 0 13px;text-indent:2em;")}>{p.t}</p>
            ))}
            <p style={s("margin-top:36px;text-align:right;")}>企业法务部</p>
            <p style={s("text-align:right;color:#8b96a8;")}>{new Date().toLocaleDateString('zh-CN')}</p>
          </div>
        </div>
      </div>

      {/* 格式门禁 */}
      <div style={s("width:296px;flex:none;background:#fff;border-left:1px solid #e3e8ef;padding:18px 18px;overflow-y:auto;")}>
        <div style={s("display:flex;align-items:center;gap:8px;margin-bottom:4px;")}>
          <div style={s("font-size:13px;font-weight:700;color:#16223a;")}>格式门禁</div>
          <span style={{ ...s("font-size:11px;padding:2px 8px;border-radius:5px;"), color: gate.passed === gate.total ? '#15803d' : '#b45309', background: gate.passed === gate.total ? '#f0fdf4' : '#fffbeb', border: `1px solid ${gate.passed === gate.total ? '#bbf7d0' : '#fde68a'}` }}>{gate.passed} / {gate.total} 通过</span>
        </div>
        <div style={s("font-size:11px;color:#aab2c0;margin-bottom:14px;")}>导出前实时校验排版与引用规范</div>
        {gate.checks.map((g, i) => (
          <div key={i} style={s("display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #f0f2f6;")}>
            <span style={{ ...s("width:8px;height:8px;flex:none;border-radius:50%;"), background: g.ok ? '#15803d' : '#b45309' }} />
            <div style={s("flex:1;font-size:12.5px;color:#4a5670;line-height:1.45;")}>{g.text}</div>
            <span style={{ ...s("flex:none;font-size:11px;padding:2px 8px;border-radius:5px;white-space:nowrap;"), color: g.ok ? '#15803d' : '#b45309', background: g.ok ? '#f0fdf4' : '#fffbeb' }}>{g.ok ? '通过' : '待确认'}</span>
          </div>
        ))}
        {gate.passed < gate.total && (
          <div style={s("margin-top:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:9px;padding:11px 13px;")}>
            <div style={s("font-size:11.5px;font-weight:700;color:#b45309;margin-bottom:3px;")}>{gate.total - gate.passed} 项待确认</div>
            <div style={s("font-size:11.5px;color:#92660e;line-height:1.6;")}>请检查未填写占位符、法条引用格式与用语一致性后再导出。</div>
          </div>
        )}
      </div>
    </div>
  )
}
