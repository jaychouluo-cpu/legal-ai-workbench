// =====================================================================
//  数据层 —— 统一汇总各业务视图的演示数据
//  来源：设计原型 dc-script 的 renderVals() + 《企事业单位法律 AI 工具箱整合方案》
//  说明：演示数据仅用于呈现工作台形态；正式落地须替换为真实接口数据，
//        并遵循「数据不出域 + license 白名单」两条红线。
// =====================================================================

// ---- 严重程度配色（合同审查）----
export const sevMap = {
  高: { color: '#b91c1c', bg: '#fef2f2', bd: '#fecaca' },
  中: { color: '#b45309', bg: '#fffbeb', bd: '#fde68a' },
  低: { color: '#1d4ed8', bg: '#eff4fb', bd: '#c7dafc' },
}

// ---- 工作台：能力工作区 ----
export const modules = [
  { key: 'contract', name: '合同审查 · 红线', en: 'ContractGuard', emoji: '📄', iconBg: '#eff4fb', iconColor: '#1d4ed8', desc: '中文合同 red flag 识别、公平度评分，一键生成 tracked-changes 红线稿。' },
  { key: 'retrieval', name: '法规 · 案例检索', en: '北大法宝 · cncases', emoji: '🔍', iconBg: '#f0fdf4', iconColor: '#15803d', desc: '法规条文与裁判文书一站检索，离线可用，结论附条文出处。' },
  { key: 'entity', name: '企业核查 · 尽调', en: '企查查 MCP', emoji: '🏢', iconBg: '#fef7ed', iconColor: '#b45309', desc: '相对方工商、涉诉、行政处罚与风险信号核查，对照准入标准。' },
  { key: 'desensitize', name: '数据脱敏 · 合规', en: 'presidio · DPA', emoji: '🔒', iconBg: '#f3f0fb', iconColor: '#6d3bd4', desc: '姓名 / 证件 / 银行卡等 PII 自动脱敏，含红章识别与 DPA 生成。' },
  { key: 'docgen', name: '文书生成 · 文格', en: 'format-skill', emoji: '✍️', iconBg: '#eef6f9', iconColor: '#0e7490', desc: '按 Word 模板生成法律意见书、律师函等，含格式门禁校验。' },
  { key: 'deadline', name: '期限管家 · 台账', en: 'period-manager', emoji: '⏱️', iconBg: '#fef2f2', iconColor: '#b91c1c', desc: '举证 / 上诉 / 答辩等法定期限倒计时与案件台账，临期提醒。' },
]

// ---- 工作台：最近处理 ----
export const recent = [
  { emoji: '📄', bg: '#eff4fb', color: '#1d4ed8', title: '《采购框架协议》审查 — 识别 6 处风险', meta: '今天 14:22 · ContractGuard', tag: '已出红线' },
  { emoji: '🏢', bg: '#fef7ed', color: '#b45309', title: '星海智能科技有限公司 — 供应商核查', meta: '今天 11:05 · 企查查 MCP', tag: '附条件准入' },
  { emoji: '🔒', bg: '#f3f0fb', color: '#6d3bd4', title: '《信息公开材料》批量脱敏 — 38 处 PII', meta: '昨天 17:40 · presidio', tag: '已脱敏' },
  { emoji: '✍️', bg: '#eef6f9', color: '#0e7490', title: '《法律意见书》生成 — 格式门禁通过', meta: '昨天 16:12 · 文格', tag: '已定稿' },
]

// ---- 工作台/助手：已挂载能力（一壳多挂）----
export const mounted = [
  { emoji: '📄', bg: '#eff4fb', color: '#1d4ed8', name: '合同审查', id: 'ContractGuard', on: true },
  { emoji: '🔍', bg: '#f0fdf4', color: '#15803d', name: '法规检索', id: 'pkulaw-mcp', on: true },
  { emoji: '🏢', bg: '#fef7ed', color: '#b45309', name: '企业核查', id: 'qcc-mcp', on: true },
  { emoji: '🔒', bg: '#f3f0fb', color: '#6d3bd4', name: '数据脱敏', id: 'presidio', on: true },
  { emoji: '✍️', bg: '#eef6f9', color: '#0e7490', name: '文书门禁', id: '文格 format-skill', on: false },
]

// ---- 工作台：四层架构（取自整合方案「4. 工具箱整合方案 · 分层架构」）----
export const architectureLayers = [
  { tag: 'L0', name: '底座层', desc: '模型 · 部署 · 数据安全', items: '智海-录问 / LexiLaw · ragflow / anything-llm · MinerU · presidio', color: '#6d3bd4', bg: '#f3f0fb', bd: '#e3d9f7' },
  { tag: 'L1', name: '检索层', desc: '法规 · 案例 · 主体', items: '北大法宝 MCP · cncases 离线 · 企查查 / 天眼查 MCP', color: '#15803d', bg: '#f0fdf4', bd: '#bbf7d0' },
  { tag: 'L2', name: '业务能力层', desc: 'Skill / Agent 按需挂载', items: 'ContractGuard · 出海DPA · 尽调 Agent · 软著/专利 · 期限管家', color: '#1d4ed8', bg: '#eff4fb', bd: '#c7dafc' },
  { tag: 'L3', name: '交付协同层', desc: '成稿 · 协同 · 可视化', items: '文格门禁 · Word 批注 · 台账/期限 · mermaid / echarts', color: '#b45309', bg: '#fffbeb', bd: '#fde68a' },
]

// ---- 合同审查：风险条款 ----
export const rawIssues = [
  { sev: '高', clause: '第 8.2 条 · 违约金', title: '违约金约定过高，存在被法院酌减风险', desc: '约定违约金为合同总额的 30%，明显高于《民法典》第585条及司法解释「以实际损失为基础、一般不超过损失 30%」的调整尺度，主张时易被酌减。', fix: '改为「按守约方实际损失计算，违约金最高不超过未付款项的 20%」，并保留损失举证条款。', law: '《民法典》第585条' },
  { sev: '高', clause: '第 11.1 条 · 合同解除', title: '单方任意解除权失衡，显失公平', desc: '仅赋予甲方任意解除权，乙方无对等权利，且未约定解除后果与补偿，存在被认定为显失公平条款的风险。', fix: '增设双方对等的法定 / 约定解除情形，明确解除通知期与已履行部分的结算方式。', law: '《民法典》第533条、第563条' },
  { sev: '中', clause: '第 5.3 条 · 付款条件', title: '付款触发条件模糊，易生争议', desc: '"验收合格后付款" 未约定验收标准、验收期限及逾期不验收的视同验收规则，付款节点不确定。', fix: '明确验收标准、验收期限（如 7 个工作日），并约定逾期未提异议视为验收通过。', law: '《民法典》第511条' },
  { sev: '中', clause: '第 14 条 · 争议解决', title: '管辖法院约定不明确', desc: '"协商不成提交有管辖权的人民法院" 未指向具体法院，约定形同虚设，可能落入被动管辖。', fix: '明确约定由甲方 / 合同签订地人民法院管辖，或选择仲裁并写明仲裁委员会名称。', law: '《民事诉讼法》第35条' },
  { sev: '中', clause: '第 10 条 · 保密义务', title: '保密义务未约定存续期限', desc: '保密条款未约定保密期限，可能被认定为仅在合同存续期间有效，不利于商业秘密长期保护。', fix: '明确保密义务在合同终止后继续有效（建议 3 年或长期），并约定违约责任。', law: '《反不正当竞争法》第9条' },
  { sev: '低', clause: '第 9 条 · 知识产权', title: '定制开发成果知识产权归属未约定', desc: '未约定定制开发成果的著作权 / 专利权归属，默认归受托方，与采购方预期可能不一致。', fix: '明确约定开发成果的知识产权归甲方所有，乙方保留必要的署名与背景技术权利。', law: '《著作权法》第19条' },
]

// ---- 法规/案例检索：结果 ----
export const retResults = [
  { kind: '法规', kindBg: '#eff4fb', kindColor: '#1d4ed8', title: '《中华人民共和国劳动合同法》第二十三条', meta: '现行有效 · 全国人大常委会 · 北大法宝', gist: '用人单位与劳动者可以约定保守商业秘密及竞业限制；约定竞业限制的，应在解除或终止劳动合同后，按月给予经济补偿。', rel: 98, badge: '条文' },
  { kind: '法规', kindBg: '#eff4fb', kindColor: '#1d4ed8', title: '《最高法关于审理劳动争议案件适用法律问题的解释（一）》第三十六条', meta: '现行有效 · 司法解释 · 北大法宝', gist: '当事人未约定经济补偿，劳动者履行竞业限制义务的，可请求按解除前十二个月平均工资的 30% 按月支付。', rel: 95, badge: '条文' },
  { kind: '案例', kindBg: '#f0fdf4', kindColor: '#15803d', title: '上海某科技公司诉王某竞业限制纠纷案', meta: '（2024）沪01民终XXXX号 · 上海一中院 · cncases', gist: '法院认为，劳动合同未明确约定补偿标准，参照劳动者离职前十二个月平均工资 30% 计算月补偿，竞业限制条款有效。', rel: 91, badge: '判例' },
  { kind: '案例', kindBg: '#f0fdf4', kindColor: '#15803d', title: '深圳某网络公司诉李某竞业限制及违约金案', meta: '（2023）粤03民终XXXX号 · 深圳中院 · cncases', gist: '约定违约金过分高于损失的，法院依申请予以酌减；竞业限制经济补偿低于法定标准的，劳动者可请求补足。', rel: 87, badge: '判例' },
]

// ---- 企业核查 ----
export const entityRisks = [
  { label: '司法案件', val: '12', sub: '近三年 4 件被告', color: '#b45309', bg: '#fffbeb', bd: '#fde68a' },
  { label: '被执行人', val: '0', sub: '无失信记录', color: '#15803d', bg: '#f0fdf4', bd: '#bbf7d0' },
  { label: '经营异常', val: '1', sub: '年报不实(已移出)', color: '#b45309', bg: '#fffbeb', bd: '#fde68a' },
  { label: '行政处罚', val: '2', sub: '环保 / 消防各 1', color: '#b91c1c', bg: '#fef2f2', bd: '#fecaca' },
  { label: '股权出质', val: '1', sub: '质押比例 12%', color: '#1d4ed8', bg: '#eff4fb', bd: '#c7dafc' },
  { label: '对外投资', val: '6', sub: '控股 3 家', color: '#16223a', bg: '#f3f5f9', bd: '#e3e8ef' },
]

export const entityCriteria = [
  { ok: true, text: '未列入失信被执行人 / 限高名单' },
  { ok: true, text: '无重大未决诉讼（标的 > 注册资本 50%）' },
  { ok: false, text: '近三年行政处罚 2 次 — 命中「≤2 次附条件准入」' },
  { ok: true, text: '注册资本与经营年限满足准入门槛' },
]

// ---- 数据脱敏 ----
export const piiEntities = [
  { type: '姓名', en: 'PERSON', count: '2 处', conf: '99%', bg: '#f3f0fb', color: '#6d3bd4' },
  { type: '公民身份号码', en: 'ID_CARD', count: '1 处', conf: '99%', bg: '#fef2f2', color: '#b91c1c' },
  { type: '手机号', en: 'PHONE', count: '2 处', conf: '98%', bg: '#eff4fb', color: '#1d4ed8' },
  { type: '银行卡号', en: 'BANK_CARD', count: '1 处', conf: '97%', bg: '#fffbeb', color: '#b45309' },
  { type: '住址', en: 'LOCATION', count: '1 处', conf: '92%', bg: '#f0fdf4', color: '#15803d' },
]

// ---- 文书生成 ----
export const rawTemplates = [
  { name: '供应商准入意见书', cat: '合规', emoji: '🏢' },
  { name: '法律意见书', cat: '综合', emoji: '⚖️' },
  { name: '律师函', cat: '争议', emoji: '✉️' },
  { name: '合规审查报告', cat: '合规', emoji: '🛡️' },
  { name: '答辩状', cat: '诉讼', emoji: '📑' },
  { name: '规章制度（草案）', cat: '治理', emoji: '📘' },
]

export const gateChecks = [
  { dot: '#15803d', text: '标题层级与三级编号规范', tag: '通过', tc: '#15803d', tb: '#f0fdf4' },
  { dot: '#15803d', text: '正文字体 仿宋_GB2312 · 三号', tag: '通过', tc: '#15803d', tb: '#f0fdf4' },
  { dot: '#15803d', text: '页边距 上下2.54 / 左右3.17 cm', tag: '通过', tc: '#15803d', tb: '#f0fdf4' },
  { dot: '#15803d', text: '法条引用格式《法律》第X条', tag: '通过', tc: '#15803d', tb: '#f0fdf4' },
  { dot: '#b45309', text: '「应当 / 不得」用语前后一致性', tag: '待确认', tc: '#b45309', tb: '#fffbeb' },
  { dot: '#15803d', text: '落款单位与日期格式', tag: '通过', tc: '#15803d', tb: '#f0fdf4' },
]

// ---- 期限管家 ----
export const deadlines = [
  { days: '2', date: '06-21', type: '举证期限', matter: '星海智能 · 买卖合同纠纷', color: '#b91c1c', bg: '#fef2f2', bd: '#fecaca', label: '紧急' },
  { days: '5', date: '06-24', type: '上诉期限', matter: '城建公司 · 劳动争议二审', color: '#b45309', bg: '#fffbeb', bd: '#fde68a', label: '临近' },
  { days: '9', date: '06-28', type: '答辩期', matter: '设备采购 · 仲裁案', color: '#b45309', bg: '#fffbeb', bd: '#fde68a', label: '临近' },
  { days: '23', date: '07-12', type: '商标续展', matter: '「法务智库」注册商标', color: '#1d4ed8', bg: '#eff4fb', bd: '#c7dafc', label: '关注' },
]

export const ledger = [
  { matter: '星海智能买卖合同纠纷', kind: '诉讼', kc: '#b91c1c', kb: '#fef2f2', party: '星海智能科技', stage: '一审举证', owner: '郑明远', status: '进行中', sc: '#b45309', sb: '#fffbeb' },
  { matter: '城建公司劳动争议二审', kind: '诉讼', kc: '#b91c1c', kb: '#fef2f2', party: '王某', stage: '二审待上诉', owner: '林晓', status: '临期', sc: '#b91c1c', sb: '#fef2f2' },
  { matter: '设备采购合同仲裁', kind: '仲裁', kc: '#6d3bd4', kb: '#f3f0fb', party: '宏达机电', stage: '答辩准备', owner: '郑明远', status: '进行中', sc: '#b45309', sb: '#fffbeb' },
  { matter: '采购框架协议审查', kind: '合同', kc: '#1d4ed8', kb: '#eff4fb', party: '星海智能科技', stage: '红线待回签', owner: '郑明远', status: '待回复', sc: '#1d4ed8', sb: '#eff4fb' },
  { matter: '“法务智库”商标续展', kind: '知产', kc: '#15803d', kb: '#f0fdf4', party: '商标局', stage: '材料准备', owner: '林晓', status: '进行中', sc: '#b45309', sb: '#fffbeb' },
]

// ---- 设置：数据接口 / 连接器 ----
export const connectors = [
  { name: '模型服务 · 智海-录问 70B', en: 'wisdomInterrogatory', mode: '内网私有化', endpoint: 'http://10.20.3.8:8000/v1', field: 'Endpoint', secret: false, status: '已连接', sc: '#15803d', sb: '#f0fdf4', sd: '#bbf7d0', icon: '🧠' },
  { name: '企查查 MCP', en: 'qcc-mcp-batch', mode: 'API', endpoint: 'qcc_sk_••••••••••••3f9a', field: 'API Key', secret: true, status: '已连接', sc: '#15803d', sb: '#f0fdf4', sd: '#bbf7d0', icon: '🏢' },
  { name: '天眼查 MCP', en: 'tianyancha-mcp', mode: 'API', endpoint: '', field: 'API Key', secret: true, status: '未配置', sc: '#8b96a8', sb: '#f3f5f9', sd: '#e3e8ef', icon: '🔎' },
  { name: '北大法宝 MCP', en: 'pkulaw-mcp-router', mode: '账号', endpoint: 'fw_account_001', field: '账号', secret: false, status: '已连接', sc: '#15803d', sb: '#f0fdf4', sd: '#bbf7d0', icon: '📚' },
  { name: 'cncases 离线裁判库', en: 'cncases', mode: '本地', endpoint: '/data/cncases/index', field: '本地路径', secret: false, status: '已挂载', sc: '#15803d', sb: '#f0fdf4', sd: '#bbf7d0', icon: '⚖️' },
]

export const tagPalette = {
  '信创 · 离线': { tagColor: '#15803d', tagBg: '#f0fdf4', tagBd: '#bbf7d0' },
  国产: { tagColor: '#1d4ed8', tagBg: '#eff4fb', tagBd: '#c7dafc' },
  需授权: { tagColor: '#b45309', tagBg: '#fffbeb', tagBd: '#fde68a' },
}

export const rawModels = [
  { name: '智海-录问 70B', en: 'wisdomInterrogatory · 国产法律大模型', tag: '信创 · 离线', active: true },
  { name: 'LexiLaw', en: 'ChatGLM 基座 · 可微调', tag: '国产', active: false },
  { name: 'DISC-LawLLM', en: '复旦 · 法律问答', tag: '国产', active: false },
  { name: '通用大模型（API）', en: '需联网 · 仅非涉密场景', tag: '需授权', active: false },
]
