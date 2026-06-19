import { useState, useCallback } from 'react'
import { s } from './lib/style.js'
import { Icon } from './components/icons.jsx'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'

import Home from './views/Home.jsx'
import Agent from './views/Agent.jsx'
import Contract from './views/Contract.jsx'
import Retrieval from './views/Retrieval.jsx'
import Entity from './views/Entity.jsx'
import Desensitize from './views/Desensitize.jsx'
import Docgen from './views/Docgen.jsx'
import Deadline from './views/Deadline.jsx'
import Settings from './views/Settings.jsx'

const TITLES = {
  home: ['工作台', '法务能力总览'],
  agent: ['AI 法务助手', '统一对话入口 · 一壳多挂'],
  contract: ['合同审查 · 红线', 'ContractGuard · 中文合同 red flag + 公平度评分'],
  retrieval: ['法规 · 案例检索', '北大法宝 MCP · cncases 离线裁判文书库'],
  entity: ['企业核查 · 尽调', '企查查 MCP · 工商 / 涉诉 / 风险信号'],
  desensitize: ['数据脱敏 · 合规', 'presidio · 中文 PII 脱敏 + DPA 生成'],
  docgen: ['文书生成 · 文格', 'legal-document-format-skill · 格式门禁'],
  deadline: ['期限管家 · 台账', 'legal-period-manager · 诉讼 / 仲裁 / 待办期限'],
  settings: ['设置', '个人信息 · 模型底座 · API 与数据接口 · 安全'],
}

export default function App() {
  const [view, setView] = useState('home')
  const navigate = useCallback((v) => setView(v), [])

  const [props] = useState(() => ({})) // reserved
  const VIEWS = {
    home: Home,
    agent: Agent,
    contract: Contract,
    retrieval: Retrieval,
    entity: Entity,
    desensitize: Desensitize,
    docgen: Docgen,
    deadline: Deadline,
    settings: Settings,
  }
  const Current = VIEWS[view]
  const [title, sub] = TITLES[view]

  return (
    <div style={s("display:flex;height:100vh;width:100%;overflow:hidden;background:#eef1f5;font-size:14px;")}>
      <Sidebar view={view} onNavigate={navigate} />
      <div style={s("flex:1;display:flex;flex-direction:column;min-width:0;")}>
        <TopBar title={title} sub={sub} />
        <main style={s("flex:1;overflow-y:auto;position:relative;")}>
          <Current navigate={navigate} {...props} />
        </main>
        <div style={s("flex:none;height:30px;background:#f6f8fb;border-top:1px solid #e7ebf1;display:flex;align-items:center;padding:0 24px;font-size:11px;color:#9aa4b4;gap:6px;")}>
          <Icon.info />
          AI 产出（审查意见、文书、检索结论）仅供提效参考，须由法律专业人员复核并保留可追溯出处；高风险事项不得由 AI 单独定稿。
        </div>
      </div>
    </div>
  )
}
