// 合同审查规则引擎（对应整合方案 ContractGuard 思路）
// 纯本地规则匹配：粘贴合同正文 → 命中风险条款 → 公平度评分 + 红线建议。
// 正式部署可切换为真实 ContractGuard 服务（接口已在「设置」中预留模型/服务位）。

const CN_NUM = { 十: 10, 二十: 20, 三十: 30, 四十: 40, 五十: 50, 六十: 60, 七十: 70, 八十: 80, 九十: 90, 百: 100 }

function pctIn(s) {
  let max = 0
  let m = s.match(/(\d{1,3})\s*%/) || s.match(/百分之\s*(\d{1,3})/)
  if (m) max = Math.max(max, parseInt(m[1], 10))
  const cn = s.match(/百分之([一二三四五六七八九十百]+)/)
  if (cn && CN_NUM[cn[1]]) max = Math.max(max, CN_NUM[cn[1]])
  return max
}

function penaltyRate(text) {
  // 取「违约金」前后各 40 字的窗口找百分比（百分比可能写在关键词之前，如「百分之三十的违约金」）
  let max = 0
  const re = /违约金/g
  let m
  while ((m = re.exec(text))) {
    const win = text.slice(Math.max(0, m.index - 40), Math.min(text.length, m.index + 40))
    max = Math.max(max, pctIn(win))
  }
  return max
}

function snippet(text, re) {
  const m = text.match(re)
  if (!m) return ''
  const i = text.indexOf(m[0])
  const s = text.slice(Math.max(0, i - 8), Math.min(text.length, i + m[0].length + 12)).replace(/\s+/g, '')
  return '…' + s + '…'
}

// 规则定义
const RULES = [
  {
    id: 'penalty', sev: '高', weight: 18, clause: '违约金',
    test: (t) => penaltyRate(t) >= 30,
    title: '违约金约定过高，存在被法院酌减风险',
    desc: (t) => `检出违约金比例约 ${penaltyRate(t)}%，明显高于「以实际损失为基础、一般不超过损失 30%」的调整尺度，主张时易被酌减。`,
    fix: '改为「按守约方实际损失计算，违约金最高不超过未付款项的 20%」，并保留损失举证条款。',
    law: '《民法典》第585条',
  },
  {
    id: 'terminate', sev: '高', weight: 16, clause: '合同解除',
    test: (t) => /(随时|单方|任意)(?:书面)?(?:通知)?[^。；\n]{0,12}解除/.test(t),
    title: '单方任意解除权失衡，显失公平',
    desc: () => '检出赋予一方任意解除权且缺乏对等安排，存在被认定为显失公平条款的风险。',
    fix: '增设双方对等的法定 / 约定解除情形，明确解除通知期与已履行部分的结算方式。',
    law: '《民法典》第533条、第563条',
  },
  {
    id: 'acceptance', sev: '中', weight: 10, clause: '付款条件',
    test: (t) => /验收合格后(?:付款|支付)/.test(t) && !/验收(?:标准|期限|\d+\s*个?工作日)/.test(t),
    title: '付款触发条件模糊，易生争议',
    desc: () => '「验收合格后付款」未约定验收标准、期限及逾期不验收的视同验收规则，付款节点不确定。',
    fix: '明确验收标准、验收期限（如 7 个工作日），并约定逾期未提异议视为验收通过。',
    law: '《民法典》第511条',
  },
  {
    id: 'jurisdiction', sev: '中', weight: 9, clause: '争议解决',
    test: (t) => /有管辖权的(?:人民)?法院/.test(t) || (/协商不成/.test(t) && /法院/.test(t) && !/(所在地|签订地|被告住所地)人民法院/.test(t)),
    title: '管辖法院约定不明确',
    desc: () => '「提交有管辖权的人民法院」未指向具体法院，约定形同虚设，可能落入被动管辖。',
    fix: '明确约定由甲方 / 合同签订地人民法院管辖，或选择仲裁并写明仲裁委员会名称。',
    law: '《民事诉讼法》第35条',
  },
  {
    id: 'confidential', sev: '中', weight: 8, clause: '保密义务',
    test: (t) => /保密/.test(t) && !/保密(?:期限|期间)|(?:终止|解除)后[^。；\n]{0,10}(?:继续|仍)[^。；\n]{0,6}保密|长期保密/.test(t),
    title: '保密义务未约定存续期限',
    desc: () => '保密条款未约定存续期限，可能被认定为仅在合同存续期间有效，不利于商业秘密长期保护。',
    fix: '明确保密义务在合同终止后继续有效（建议 3 年或长期），并约定违约责任。',
    law: '《反不正当竞争法》第9条',
  },
  {
    id: 'ip', sev: '低', weight: 5, clause: '知识产权',
    test: (t) => /(知识产权|开发成果|著作权)/.test(t) && /(按实际情况|另行(?:确定|约定)|双方协商(?:确定)?|权利归属由双方)/.test(t),
    title: '开发成果知识产权归属未明确',
    desc: () => '定制开发成果的知识产权归属表述含糊（「按实际情况 / 另行约定」），与采购方预期可能不一致。',
    fix: '明确约定开发成果的知识产权归甲方所有，乙方保留必要的署名与背景技术权利。',
    law: '《著作权法》第19条',
  },
]

const SEV_W = { 高: 1, 中: 1, 低: 1 }

export function reviewContract(text) {
  const issues = []
  for (const r of RULES) {
    let hit = false
    try { hit = r.test(text) } catch { hit = false }
    if (!hit) continue
    issues.push({
      id: r.id, sev: r.sev, clause: r.clause, title: r.title,
      desc: r.desc(text), fix: r.fix, law: r.law, weight: r.weight,
      evidence: snippet(text, new RegExp(r.clause)) || '',
    })
  }
  const counts = { 高: 0, 中: 0, 低: 0 }
  let deduction = 0
  for (const it of issues) { counts[it.sev]++; deduction += it.weight }
  const score = Math.max(20, 100 - deduction)
  // 排序：高>中>低
  const order = { 高: 0, 中: 1, 低: 2 }
  issues.sort((a, b) => order[a.sev] - order[b.sev])
  return { issues, counts, score, total: issues.length, reviewed: text.trim().length > 0 }
}

export const SAMPLE_CONTRACT = `采购框架协议（节选）

第5条 价款与支付
5.3 甲方应在验收合格后付款，具体付款时间由双方另行确认。

第8条 违约责任
8.2 任何一方违反本协议约定的，应向守约方支付相当于合同总额百分之三十（30%）的违约金，并赔偿由此造成的全部损失。

第9条 知识产权
9.1 乙方在履行本协议过程中形成的开发成果，其权利归属由双方按实际情况处理。

第10条 保密
10.1 双方对在合作中知悉的对方商业秘密负有保密义务，不得向第三方披露。

第11条 协议解除
11.1 甲方有权随时书面通知乙方解除本协议，乙方应予配合。

第14条 争议解决
14.1 因本协议引起的争议，双方应协商解决；协商不成的，提交有管辖权的人民法院诉讼解决。`
