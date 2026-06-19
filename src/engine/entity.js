// 供应商准入规则评估引擎
// 真实工商/涉诉数据需企查查 / 天眼查 API（在「设置」中配置 Key）；
// 此处对录入或获取到的风险指标做本地规则评估，得出准入结论 —— 评估逻辑真实可用。

// 输入字段定义（供表单使用）
export const ENTITY_FIELDS = [
  { k: 'name', label: '企业名称', def: '星海智能科技有限公司', type: 'text' },
  { k: 'dishonest', label: '失信被执行 / 限高', def: false, type: 'bool' },
  { k: 'majorSuit', label: '重大未决诉讼(标的>注册资本50%)', def: false, type: 'bool' },
  { k: 'penalties', label: '近三年行政处罚次数', def: 2, type: 'num' },
  { k: 'abnormal', label: '经营异常(未移出)', def: 0, type: 'num' },
  { k: 'capitalOk', label: '注册资本/经营年限达门槛', def: true, type: 'bool' },
]

// 评估规则：返回 {verdict, level, color, bg, bd, criteria[]}
export function assessEntity(v) {
  const criteria = []
  let veto = false
  let conditional = false

  criteria.push({ ok: !v.dishonest, text: v.dishonest ? '已列入失信被执行 / 限高名单（一票否决）' : '未列入失信被执行 / 限高名单' })
  if (v.dishonest) veto = true

  criteria.push({ ok: !v.majorSuit, text: v.majorSuit ? '存在重大未决诉讼（一票否决）' : '无重大未决诉讼（标的 > 注册资本 50%）' })
  if (v.majorSuit) veto = true

  const pen = Number(v.penalties) || 0
  if (pen <= 2) {
    criteria.push({ ok: pen === 0, text: pen === 0 ? '近三年无行政处罚' : `近三年行政处罚 ${pen} 次 — 命中「≤2 次附条件准入」` })
    if (pen > 0) conditional = true
  } else {
    criteria.push({ ok: false, text: `近三年行政处罚 ${pen} 次（>2，超出附条件准入阈值）` })
    veto = true
  }

  const abn = Number(v.abnormal) || 0
  criteria.push({ ok: abn === 0, text: abn === 0 ? '无未移出的经营异常' : `存在 ${abn} 项未移出经营异常` })
  if (abn > 0) conditional = true

  criteria.push({ ok: !!v.capitalOk, text: v.capitalOk ? '注册资本与经营年限满足准入门槛' : '注册资本 / 经营年限未达门槛' })
  if (!v.capitalOk) conditional = true

  let verdict, color, bg, bd
  if (veto) {
    verdict = '不予准入'; color = '#b91c1c'; bg = '#fef2f2'; bd = '#fecaca'
  } else if (conditional) {
    verdict = '附条件准入'; color = '#b45309'; bg = '#fffbeb'; bd = '#fde68a'
  } else {
    verdict = '准予准入'; color = '#15803d'; bg = '#f0fdf4'; bd = '#bbf7d0'
  }
  return { verdict, color, bg, bd, criteria }
}
