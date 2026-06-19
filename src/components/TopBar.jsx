import { s } from '../lib/style.js'
import { Icon } from './icons.jsx'

export default function TopBar({ title, sub }) {
  return (
    <header style={s("height:58px;flex:none;background:#fff;border-bottom:1px solid #e3e8ef;display:flex;align-items:center;padding:0 24px;gap:16px;")}>
      <div style={s("font-size:16px;font-weight:700;color:#16223a;")}>{title}</div>
      <div style={s("font-size:12.5px;color:#8b96a8;")}>{sub}</div>
      <div style={s("flex:1;")} />
      <div style={s("display:flex;align-items:center;gap:7px;")}>
        <span style={s("display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:4px 9px;border-radius:20px;")}>
          <Icon.shield />数据不出域
        </span>
        <span style={s("font-size:11.5px;color:#1d4ed8;background:#eff4fb;border:1px solid #c7dafc;padding:4px 9px;border-radius:20px;")}>信创 · 国产化</span>
      </div>
      <div style={s("width:1px;height:24px;background:#e3e8ef;")} />
      <div style={s("display:flex;align-items:center;gap:9px;")}>
        <div style={s("text-align:right;line-height:1.25;")}>
          <div style={s("font-size:12.5px;font-weight:500;color:#16223a;")}>郑明远</div>
          <div style={s("font-size:10.5px;color:#8b96a8;")}>合规部 · 高级法务</div>
        </div>
        <div style={s("width:34px;height:34px;border-radius:50%;background:#dde6f4;color:#1d4ed8;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;")}>郑</div>
      </div>
    </header>
  )
}
