import { useState, useMemo } from 'react'
import { s } from '../lib/style.js'
import { sevMap } from '../data.js'
import { reviewContract, SAMPLE_CONTRACT } from '../engine/contract.js'

export default function Contract({ navigate }) {
  const [text, setText] = useState(SAMPLE_CONTRACT)
  const [sel, setSel] = useState(0)
  const review = useMemo(() => reviewContract(text), [text])
  const issues = review.issues

  // 公平度环形进度
  const scoreColor = review.score >= 80 ? '#15803d' : review.score >= 60 ? '#b45309' : '#b91c1c'
  const pct = review.score

  return (
    <div style={s("display:flex;height:100%;")}>
      {/* 文档 / 输入 */}
      <div style={s("flex:1;min-width:0;display:flex;flex-direction:column;background:#eef1f5;")}>
        <div style={s("flex:none;display:flex;align-items:center;gap:12px;padding:14px 24px;background:#fff;border-bottom:1px solid #e3e8ef;")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" style={{ flex: 'none' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
          <div style={s("flex:1;min-width:0;")}>
            <div style={s("font-size:14px;font-weight:500;color:#16223a;")}>合同正文（可粘贴 / 编辑）</div>
            <div style={s("font-size:11.5px;color:#aab2c0;")}>{text.trim().length} 字 · 本地规则实时审查 · 数据不出域</div>
          </div>
          <button onClick={() => setText(SAMPLE_CONTRACT)} style={s("flex:none;font-size:12.5px;color:#16223a;background:#fff;border:1px solid #d8dfe9;padding:7px 13px;border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;")}>载入示例</button>
          <button onClick={() => setText('')} style={s("flex:none;font-size:12.5px;color:#16223a;background:#fff;border:1px solid #d8dfe9;padding:7px 13px;border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;")}>清空</button>
        </div>

        <div style={s("flex:1;overflow-y:auto;padding:26px;")}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="在此粘贴合同文本，系统将基于规则库自动识别违约金过高、任意解除、管辖不明、验收模糊、保密无期限、知产归属不清等风险条款。"
            style={s("display:block;max-width:720px;margin:0 auto;width:100%;min-height:520px;background:#fff;border:1px solid #e7ebf1;border-radius:6px;padding:40px 46px;font-size:14px;line-height:2.0;color:#2a3650;box-shadow:0 2px 14px rgba(20,34,58,0.05);font-family:inherit;outline:none;resize:vertical;")} className="field-input" />
        </div>
      </div>

      {/* 审查结果 */}
      <div style={s("width:368px;flex:none;background:#fff;border-left:1px solid #e3e8ef;display:flex;flex-direction:column;")}>
        <div style={s("flex:none;padding:18px 20px 16px;border-bottom:1px solid #eef1f5;")}>
          <div style={s("display:flex;align-items:center;justify-content:space-between;")}>
            <div style={s("font-size:14px;font-weight:700;color:#16223a;")}>审查结果</div>
            <span style={s("font-size:11px;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:3px 9px;border-radius:6px;")}>规则引擎 · 本地</span>
          </div>
          <div style={s("display:flex;align-items:center;gap:16px;margin-top:14px;")}>
            <div style={{ ...s("width:78px;height:78px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;"), background: `conic-gradient(${scoreColor} 0% ${pct}%,#eef1f5 ${pct}% 100%)` }}>
              <div style={s("width:60px;height:60px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;")}>
                <div style={{ ...s("font-family:'IBM Plex Mono',monospace;font-size:23px;font-weight:600;line-height:1;"), color: scoreColor }}>{review.score}</div>
                <div style={s("font-size:9.5px;color:#aab2c0;margin-top:2px;")}>公平度</div>
              </div>
            </div>
            <div style={s("flex:1;")}>
              <div style={s("font-size:12.5px;color:#7a8699;margin-bottom:8px;")}>共识别 <b style={s("color:#16223a;")}>{review.total}</b> 处风险条款</div>
              <div style={s("display:flex;gap:7px;")}>
                <span style={s("flex:1;text-align:center;font-size:11.5px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;padding:5px 0;border-radius:7px;")}>高危 {review.counts.高}</span>
                <span style={s("flex:1;text-align:center;font-size:11.5px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;padding:5px 0;border-radius:7px;")}>中危 {review.counts.中}</span>
                <span style={s("flex:1;text-align:center;font-size:11.5px;color:#1d4ed8;background:#eff4fb;border:1px solid #c7dafc;padding:5px 0;border-radius:7px;")}>低危 {review.counts.低}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={s("flex:1;overflow-y:auto;padding:14px 16px 20px;")}>
          {issues.length === 0 && (
            <div style={s("text-align:center;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:11px;padding:24px 16px;font-size:13px;")}>
              {review.reviewed ? '✓ 未命中已知风险规则。仍建议人工复核全文。' : '请在左侧粘贴合同文本开始审查。'}
            </div>
          )}
          {issues.map((it, idx) => {
            const sv = sevMap[it.sev]
            const active = idx === sel
            return (
              <div key={it.id} onClick={() => setSel(idx)} style={{
                ...s("border-radius:11px;padding:13px 14px;margin-bottom:10px;cursor:pointer;transition:all .15s;"),
                border: `1.5px solid ${active ? sv.color : '#e7ebf1'}`, background: active ? '#fff' : '#fbfcfe',
                boxShadow: active ? '0 6px 18px rgba(20,34,58,0.10)' : 'none',
              }}>
                <div style={s("display:flex;align-items:center;gap:8px;margin-bottom:6px;")}>
                  <span style={{ ...s("font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px;"), color: sv.color, background: sv.bg, border: `1px solid ${sv.bd}` }}>{it.sev}危</span>
                  <span style={s("font-size:11.5px;color:#8b96a8;font-family:'IBM Plex Mono',monospace;")}>{it.clause}</span>
                </div>
                <div style={s("font-size:13px;font-weight:500;color:#16223a;line-height:1.5;")}>{it.title}</div>
                <div style={s("font-size:12px;color:#7a8699;line-height:1.65;margin-top:6px;")}>{it.desc}</div>
                {it.evidence && <div style={s("font-size:11px;color:#8b96a8;margin-top:6px;background:#f6f8fb;border-radius:6px;padding:5px 8px;font-family:'IBM Plex Mono',monospace;")}>命中：{it.evidence}</div>}
                {active && (
                  <>
                    <div style={s("margin-top:11px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 12px;")}>
                      <div style={s("font-size:11.5px;font-weight:700;color:#15803d;margin-bottom:4px;")}>建议红线修改</div>
                      <div style={s("font-size:12px;color:#2a5a3c;line-height:1.65;")}>{it.fix}</div>
                      <div style={s("font-size:11px;color:#15803d;margin-top:7px;font-family:'IBM Plex Mono',monospace;")}>依据 {it.law}</div>
                    </div>
                    <div style={s("display:flex;gap:8px;margin-top:10px;")}>
                      <button onClick={(e) => { e.stopPropagation(); navigate('docgen') }} style={s("flex:1;font-size:12px;color:#fff;background:#1d4ed8;border:none;padding:8px 0;border-radius:7px;cursor:pointer;font-family:inherit;")}>生成红线意见书</button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
