import { useState, useMemo } from 'react'
import { s } from '../lib/style.js'
import { searchCorpus } from '../engine/corpus.js'

const TABS = [
  { key: 'all', label: '全部' },
  { key: '法规', label: '法规条文' },
  { key: '案例', label: '裁判案例' },
]

const KIND_COLOR = { 法规: { c: '#1d4ed8', b: '#eff4fb' }, 案例: { c: '#15803d', b: '#f0fdf4' } }

export default function Retrieval() {
  const [query, setQuery] = useState('竞业限制 经济补偿')
  const [submitted, setSubmitted] = useState('竞业限制 经济补偿')
  const [tab, setTab] = useState('all')

  const results = useMemo(() => searchCorpus(submitted, tab), [submitted, tab])

  return (
    <div style={s("padding:26px 32px 40px;max-width:980px;margin:0 auto;")}>
      <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:13px;padding:8px 8px 8px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 2px 12px rgba(20,34,58,0.05);")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b96a8" strokeWidth="1.8" style={{ flex: 'none' }}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') setSubmitted(query) }}
          placeholder="输入关键词检索内置法规 / 案例库（空格分隔多个词）"
          style={s("flex:1;border:none;outline:none;font-family:inherit;font-size:14px;color:#16223a;background:transparent;")} />
        <span style={s("font-size:11.5px;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:4px 9px;border-radius:6px;white-space:nowrap;")}>本地库 · 离线</span>
        <button onClick={() => setSubmitted(query)} style={s("font-size:13px;color:#fff;background:#1d4ed8;border:none;padding:9px 20px;border-radius:9px;cursor:pointer;font-family:inherit;")}>检索</button>
      </div>

      <div style={s("display:flex;align-items:center;gap:9px;margin:18px 0 16px;")}>
        {TABS.map((t) => {
          const on = tab === t.key
          return (
            <span key={t.key} onClick={() => setTab(t.key)} style={{
              ...s("font-size:12.5px;cursor:pointer;padding:6px 15px;border-radius:8px;"),
              color: on ? '#fff' : '#7a8699', background: on ? '#1d4ed8' : '#f3f5f9', border: `1px solid ${on ? '#1d4ed8' : '#e3e8ef'}`,
            }}>{t.label}</span>
          )
        })}
        <div style={s("flex:1;")} />
        <span style={s("font-size:12px;color:#aab2c0;")}>{results.length} 条结果 · 按相关度排序</span>
      </div>

      <div style={s("background:linear-gradient(135deg,#0e1f3d,#16335f);border-radius:13px;padding:18px 20px;color:#fff;margin-bottom:18px;")}>
        <div style={s("display:flex;align-items:center;gap:8px;margin-bottom:9px;")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7aa7e9" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1-6.3-4.6L5.7 21 8 14 2 9.4h7.6z" /></svg>
          <span style={s("font-size:12.5px;font-weight:700;")}>检索摘要</span>
        </div>
        <div style={s("font-size:13px;line-height:1.85;color:#dbe4f3;")}>
          {results.length > 0
            ? <>命中 {results.length} 条与「{submitted}」相关的法规 / 案例，最相关：<b style={s("color:#fff;")}>{results[0].title}</b>。{results[0].gist} <span style={s("color:#9fb0d0;")}>结论附条文与判例出处，须人工复核。</span></>
            : <>未在内置库中命中「{submitted}」。可更换关键词，或在「设置 · API 与数据接口」配置北大法宝账号做在线增强检索。</>}
        </div>
      </div>

      {results.map((r, i) => {
        const kc = KIND_COLOR[r.kind]
        return (
          <div key={i} className="result-card" style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;padding:17px 19px;margin-bottom:12px;cursor:pointer;")}>
            <div style={s("display:flex;align-items:center;gap:9px;margin-bottom:8px;")}>
              <span style={{ ...s("font-size:11px;font-weight:700;padding:2px 9px;border-radius:5px;"), color: kc.c, background: kc.b }}>{r.badge}</span>
              <span style={s("font-size:14px;font-weight:500;color:#16223a;")}>{r.title}</span>
              <div style={s("flex:1;")} />
              <span style={s("font-size:11px;color:#15803d;font-family:'IBM Plex Mono',monospace;white-space:nowrap;")}>相关度 {r.rel}%</span>
            </div>
            <div style={s("font-size:11.5px;color:#aab2c0;margin-bottom:8px;font-family:'IBM Plex Mono',monospace;")}>{r.meta}</div>
            <div style={s("font-size:13px;color:#4a5670;line-height:1.75;")}>{r.gist}</div>
          </div>
        )
      })}
    </div>
  )
}
