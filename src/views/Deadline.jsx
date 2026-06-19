import { useState, useMemo } from 'react'
import { s } from '../lib/style.js'
import { load, save } from '../lib/storage.js'

const KEY = 'lawbox.deadlines.v1'
const GRID = 'grid-template-columns:2fr 0.8fr 1.3fr 1.2fr 0.9fr 1fr 0.5fr;gap:12px;'

const KIND_STYLE = {
  诉讼: { kc: '#b91c1c', kb: '#fef2f2' }, 仲裁: { kc: '#6d3bd4', kb: '#f3f0fb' },
  合同: { kc: '#1d4ed8', kb: '#eff4fb' }, 知产: { kc: '#15803d', kb: '#f0fdf4' }, 其他: { kc: '#8b96a8', kb: '#f3f5f9' },
}

const SEED = [
  { id: 'd1', type: '举证期限', matter: '星海智能 · 买卖合同纠纷', party: '星海智能科技', owner: '郑明远', date: '2026-06-21', kind: '诉讼' },
  { id: 'd2', type: '上诉期限', matter: '城建公司 · 劳动争议二审', party: '王某', owner: '林晓', date: '2026-06-24', kind: '诉讼' },
  { id: 'd3', type: '答辩期', matter: '设备采购 · 仲裁案', party: '宏达机电', owner: '郑明远', date: '2026-06-28', kind: '仲裁' },
  { id: 'd4', type: '商标续展', matter: '「法务智库」注册商标', party: '商标局', owner: '林晓', date: '2026-07-12', kind: '知产' },
]

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d - today) / 86400000)
}
function urgency(days) {
  if (days < 0) return { color: '#8b96a8', bg: '#f3f5f9', bd: '#e3e8ef', label: '已过期', sc: '#8b96a8', sb: '#f3f5f9' }
  if (days <= 3) return { color: '#b91c1c', bg: '#fef2f2', bd: '#fecaca', label: '紧急', sc: '#b91c1c', sb: '#fef2f2' }
  if (days <= 10) return { color: '#b45309', bg: '#fffbeb', bd: '#fde68a', label: '临近', sc: '#b45309', sb: '#fffbeb' }
  return { color: '#1d4ed8', bg: '#eff4fb', bd: '#c7dafc', label: '关注', sc: '#1d4ed8', sb: '#eff4fb' }
}

export default function Deadline() {
  const [items, setItems] = useState(() => load(KEY, SEED))
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ type: '', matter: '', party: '', owner: '', date: '', kind: '诉讼' })

  const persist = (next) => { setItems(next); save(KEY, next) }

  const enriched = useMemo(() => items
    .map((it) => ({ ...it, days: daysUntil(it.date), u: urgency(daysUntil(it.date)) }))
    .sort((a, b) => a.days - b.days), [items])

  const upcoming = enriched.filter((e) => e.days >= 0).slice(0, 4)

  const addItem = () => {
    if (!form.type || !form.date) return
    const id = 'd' + Math.random().toString(36).slice(2, 8)
    persist([...items, { ...form, id }])
    setForm({ type: '', matter: '', party: '', owner: '', date: '', kind: '诉讼' })
    setAdding(false)
  }
  const remove = (id) => persist(items.filter((i) => i.id !== id))

  const fld = (k, ph, w) => (
    <input value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} placeholder={ph}
      style={{ ...s("border:1px solid #d8dfe9;border-radius:7px;padding:7px 10px;font-family:inherit;font-size:12.5px;color:#16223a;outline:none;"), width: w }} className="field-input" />
  )

  return (
    <div style={s("padding:26px 32px 40px;max-width:1160px;margin:0 auto;")}>
      <div style={s("font-size:13px;font-weight:700;color:#16223a;margin-bottom:13px;")}>临期事项（自动按到期日计算剩余天数）</div>
      <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;")}>
        {upcoming.length === 0 && <div style={s("color:#aab2c0;font-size:13px;")}>暂无临期事项。</div>}
        {upcoming.map((d) => (
          <div key={d.id} style={{ ...s("background:#fff;border:1px solid #e7ebf1;border-radius:11px;padding:16px 16px 15px;"), borderTop: `3px solid ${d.u.color}` }}>
            <div style={s("display:flex;align-items:center;justify-content:space-between;")}>
              <span style={{ ...s("font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px;"), color: d.u.color, background: d.u.bg, border: `1px solid ${d.u.bd}` }}>{d.u.label}</span>
              <span style={s("font-size:11.5px;color:#aab2c0;font-family:'IBM Plex Mono',monospace;")}>{d.date.slice(5)}</span>
            </div>
            <div style={s("display:flex;align-items:baseline;gap:5px;margin-top:11px;")}>
              <span style={{ ...s("font-family:'IBM Plex Mono',monospace;font-size:30px;font-weight:600;line-height:1;"), color: d.u.color }}>{d.days}</span>
              <span style={s("font-size:12px;color:#8b96a8;")}>天后到期</span>
            </div>
            <div style={s("font-size:13px;color:#16223a;margin-top:9px;font-weight:500;")}>{d.type}</div>
            <div style={s("font-size:11.5px;color:#8b96a8;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{d.matter}</div>
          </div>
        ))}
      </div>

      <div style={s("display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;")}>
        <div style={s("font-size:13px;font-weight:700;color:#16223a;")}>案件 · 事项台账（{items.length}）</div>
        <button onClick={() => setAdding((a) => !a)} style={s("font-size:12.5px;color:#1d4ed8;background:#eff4fb;border:1px solid #c7dafc;padding:7px 14px;border-radius:8px;cursor:pointer;font-family:inherit;")}>{adding ? '取消' : '+ 新建事项'}</button>
      </div>

      {adding && (
        <div style={s("background:#fff;border:1px solid #c7dafc;border-radius:12px;padding:16px 18px;margin-bottom:14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;")}>
          {fld('type', '事项类型 *', '130px')}
          {fld('matter', '案件 / 事项', '200px')}
          {fld('party', '相对方', '130px')}
          {fld('owner', '负责人', '90px')}
          <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))} style={s("border:1px solid #d8dfe9;border-radius:7px;padding:7px 10px;font-family:inherit;font-size:12.5px;color:#16223a;outline:none;")}>
            {Object.keys(KIND_STYLE).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={s("border:1px solid #d8dfe9;border-radius:7px;padding:6px 10px;font-family:inherit;font-size:12.5px;color:#16223a;outline:none;")} />
          <button onClick={addItem} style={s("font-size:12.5px;color:#fff;background:#1d4ed8;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-family:inherit;")}>保存</button>
        </div>
      )}

      <div style={s("background:#fff;border:1px solid #e7ebf1;border-radius:12px;overflow:hidden;")}>
        <div style={{ ...s("display:grid;padding:12px 20px;background:#f6f8fb;border-bottom:1px solid #eef1f5;font-size:11.5px;color:#8b96a8;font-weight:500;"), ...s(GRID) }}>
          <div>案件 / 事项</div><div>类型</div><div>相对方</div><div>到期 / 倒计时</div><div>负责人</div><div>状态</div><div></div>
        </div>
        {enriched.map((row) => {
          const ks = KIND_STYLE[row.kind] || KIND_STYLE.其他
          return (
            <div key={row.id} style={{ ...s("display:grid;padding:13px 20px;border-bottom:1px solid #f4f6f9;align-items:center;font-size:13px;color:#2a3650;"), ...s(GRID) }}>
              <div style={s("color:#16223a;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{row.matter || row.type}</div>
              <div><span style={{ ...s("font-size:11.5px;padding:2px 8px;border-radius:5px;"), color: ks.kc, background: ks.kb }}>{row.kind}</span></div>
              <div style={s("color:#4a5670;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{row.party || '—'}</div>
              <div style={s("color:#4a5670;font-family:'IBM Plex Mono',monospace;font-size:12px;")}>{row.date} · <b style={{ color: row.u.color }}>{row.days < 0 ? '已过期' : row.days + '天'}</b></div>
              <div style={s("color:#4a5670;")}>{row.owner || '—'}</div>
              <div><span style={{ ...s("font-size:11.5px;padding:2px 8px;border-radius:5px;"), color: row.u.sc, background: row.u.sb }}>{row.u.label}</span></div>
              <div><span onClick={() => remove(row.id)} title="删除" style={s("cursor:pointer;color:#aab2c0;font-size:14px;")}>✕</span></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
