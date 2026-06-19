import { useState, useMemo } from 'react'
import { s } from '../lib/style.js'
import { analyze, SAMPLE_TEXT } from '../engine/mask.js'
import { download } from '../engine/docgen.js'

export default function Desensitize() {
  const [text, setText] = useState(SAMPLE_TEXT)
  const [masked, setMasked] = useState(true)
  const result = useMemo(() => analyze(text), [text])
  const [copied, setCopied] = useState(false)

  const shown = masked ? result.masked : text

  const copy = async () => {
    try { await navigator.clipboard.writeText(result.masked); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* */ }
  }

  return (
    <div style={s("padding:22px 32px 40px;display:flex;gap:20px;max-width:1180px;margin:0 auto;align-items:flex-start;")}>
      {/* 左：输入 + 输出 */}
      <div style={s("flex:1;min-width:0;")}>
        <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:10px;")}>
          <div style={s("font-size:14px;font-weight:500;color:#16223a;")}>原文输入</div>
          <span style={s("font-size:11.5px;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:3px 9px;border-radius:6px;")}>presidio + 中文规则 · 本地运行</span>
          <div style={s("flex:1;")} />
          <button onClick={() => setText(SAMPLE_TEXT)} style={btnGhost}>载入示例</button>
          <button onClick={() => setText('')} style={btnGhost}>清空</button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="粘贴含个人信息的文本，自动识别并脱敏。原文不出本机。"
          style={s("width:100%;height:150px;border:1px solid #d8dfe9;border-radius:11px;padding:14px 16px;font-family:inherit;font-size:13.5px;line-height:1.9;color:#16223a;outline:none;resize:vertical;background:#fff;")} className="field-input" />

        <div style={s("display:flex;align-items:center;gap:12px;margin:16px 0 10px;")}>
          <div style={s("font-size:14px;font-weight:500;color:#16223a;")}>脱敏结果</div>
          <div style={s("flex:1;")} />
          <span style={s("font-size:12px;color:#7a8699;")}>{masked ? '已脱敏' : '显示原文'}</span>
          <span onClick={() => setMasked((m) => !m)} style={{ ...s("width:38px;height:21px;border-radius:11px;position:relative;cursor:pointer;flex:none;transition:background .15s;"), background: masked ? '#1d4ed8' : '#cbd5e1' }}>
            <span style={{ ...s("position:absolute;top:2px;width:17px;height:17px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.25);transition:left .15s;"), left: masked ? '19px' : '2px' }} />
          </span>
        </div>
        <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:11px;padding:18px 20px;font-size:14px;line-height:2.0;color:#2a3650;min-height:90px;white-space:pre-wrap;word-break:break-word;box-shadow:0 2px 12px rgba(20,34,58,0.04);")}>
          {shown || <span style={s("color:#aab2c0;")}>（结果将显示在此）</span>}
        </div>

        <div style={s("display:flex;gap:10px;margin-top:14px;")}>
          <button onClick={() => download('脱敏副本.txt', result.masked, 'text/plain')} style={btnPrimary}>导出脱敏副本</button>
          <button onClick={copy} style={btnGhost}>{copied ? '已复制 ✓' : '复制脱敏文本'}</button>
        </div>
      </div>

      {/* 右：识别到的实体 */}
      <div style={s("width:300px;flex:none;background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:18px 18px;")}>
        <div style={s("display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px;")}>
          <div style={s("font-size:13px;font-weight:700;color:#16223a;")}>识别到的个人信息</div>
          <span style={s("font-family:'IBM Plex Mono',monospace;font-size:13px;color:#6d3bd4;")}>{result.total} 处</span>
        </div>
        <div style={s("font-size:11px;color:#aab2c0;margin-bottom:14px;")}>本地处理 · 原文不出域</div>
        {result.entities.length === 0 && <div style={s("font-size:12.5px;color:#aab2c0;padding:14px 0;")}>未识别到个人信息。</div>}
        {result.entities.map((e, i) => (
          <div key={i} style={s("display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid #f0f2f6;")}>
            <div style={{ ...s("width:32px;height:32px;flex:none;border-radius:8px;display:flex;align-items:center;justify-content:center;"), background: e.bg, color: e.color }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <div style={s("flex:1;min-width:0;")}>
              <div style={s("font-size:12.5px;color:#16223a;")}>{e.type}</div>
              <div style={s("font-size:10.5px;color:#aab2c0;font-family:'IBM Plex Mono',monospace;")}>{e.en}</div>
            </div>
            <div style={s("text-align:right;")}>
              <div style={s("font-size:12px;color:#16223a;")}>{e.count}</div>
              <div style={s("font-size:10.5px;color:#15803d;")}>{e.conf}</div>
            </div>
          </div>
        ))}
        <div style={s("margin-top:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:9px;padding:11px 13px;font-size:11px;color:#3a7a52;line-height:1.6;")}>
          支持身份证、手机号、银行卡、邮箱、姓名、住址识别。复杂场景可接入 presidio 服务增强中文 NER。
        </div>
      </div>
    </div>
  )
}

const btnPrimary = s("font-size:12.5px;color:#fff;background:#1d4ed8;border:none;padding:9px 16px;border-radius:8px;cursor:pointer;font-family:inherit;")
const btnGhost = s("font-size:12.5px;color:#16223a;background:#fff;border:1px solid #d8dfe9;padding:9px 16px;border-radius:8px;cursor:pointer;font-family:inherit;")
