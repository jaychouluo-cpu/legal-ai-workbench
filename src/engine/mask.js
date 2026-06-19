// 本地 PII 脱敏引擎（对应整合方案 presidio + 中文规则）
// 全部在浏览器内运行，原文不出域。识别中国常见个人信息并做掩码。
// 识别顺序很重要：先长后短，避免身份证/银行卡被手机号规则误切。

const SURNAMES = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳唐罗薛伍余米贝姚孟顾尹江钟徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊甄家封芮储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭历戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴胥能苍双闻莘党翟谭贡劳逄'

// 各类实体的展示元数据（与原型配色一致）
export const ENTITY_META = {
  ID_CARD:   { type: '公民身份号码', bg: '#fef2f2', color: '#b91c1c' },
  BANK_CARD: { type: '银行卡号',     bg: '#fffbeb', color: '#b45309' },
  PHONE:     { type: '手机号',       bg: '#eff4fb', color: '#1d4ed8' },
  EMAIL:     { type: '电子邮箱',     bg: '#eef6f9', color: '#0e7490' },
  PERSON:    { type: '姓名',         bg: '#f3f0fb', color: '#6d3bd4' },
  LOCATION:  { type: '住址',         bg: '#f0fdf4', color: '#15803d' },
}

// 部分掩码策略：保留少量首尾字符，其余以 * 代替
function maskValue(type, v) {
  const digits = v.replace(/[\s-]/g, '')
  switch (type) {
    case 'ID_CARD':   return digits.slice(0, 4) + '**********' + digits.slice(-4)
    case 'BANK_CARD': return digits.slice(0, 4) + ' **** **** ' + digits.slice(-4)
    case 'PHONE':     return digits.slice(0, 3) + '****' + digits.slice(-4)
    case 'EMAIL': {
      const [u, d] = v.split('@'); return (u ? u[0] : '') + '***@' + (d || '')
    }
    case 'PERSON':    return v[0] + '*'.repeat(Math.max(1, v.length - 1))
    case 'LOCATION':  return v.slice(0, 6) + '****'
    default:          return '***'
  }
}

// 规则集（按优先级）
function buildMatchers() {
  return [
    { type: 'ID_CARD', conf: 99, re: /[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]/g },
    { type: 'BANK_CARD', conf: 97, re: /\b\d{4}(?:[\s-]?\d{4}){2,4}\d{0,3}\b/g, min: 16, max: 19 },
    { type: 'PHONE', conf: 98, re: /(?:(?<!\d))1[3-9]\d[\s-]?\d{4}[\s-]?\d{4}(?!\d)/g },
    { type: 'EMAIL', conf: 99, re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
    // 住址：省/市/区 + 路/街/号
    { type: 'LOCATION', conf: 90, re: /[一-龥]{2,}(?:省|市|自治区|特别行政区)?[一-龥]{2,}(?:市|州|盟)[一-龥]{2,}(?:区|县|旗|市)[一-龥0-9]{0,30}?(?:路|街|道|巷|号|弄|大厦|广场|小区|村)[一-龥0-9]{0,8}号?/g },
  ]
}

// 姓名识别：1) 标签触发（法定代表人/紧急联系人/姓名/联系人/经办人 后跟 2-4 字中文名）
//           2) 百家姓 + 1-2 个中文字
function findNames(text, taken) {
  const found = []
  const labelRe = /(?:法定代表人|紧急联系人|联系人|经办人|姓名|委托人|当事人|乙方代表|甲方代表)[：:\s]*([一-龥]{2,4})/g
  let m
  while ((m = labelRe.exec(text))) {
    const name = m[1]
    const start = m.index + m[0].indexOf(name)
    if (!overlaps(start, start + name.length, taken)) found.push({ start, end: start + name.length, value: name })
  }
  const surnameRe = new RegExp(`(?<![\\u4e00-\\u9fa5])[${SURNAMES}][\\u4e00-\\u9fa5]{1,2}(?![\\u4e00-\\u9fa5])`, 'g')
  while ((m = surnameRe.exec(text))) {
    const v = m[0]
    // 过滤明显非人名的常见词
    if (/公司|有限|银行|大学|医院|法院|人民|中国|工程|科技|集团/.test(v)) continue
    if (!overlaps(m.index, m.index + v.length, taken) && !found.some((f) => f.start === m.index))
      found.push({ start: m.index, end: m.index + v.length, value: v })
  }
  return found
}

function overlaps(a, b, ranges) {
  return ranges.some((r) => a < r.end && b > r.start)
}

// 主函数：返回 { masked, original, spans, entities }
export function analyze(text) {
  if (!text) return { masked: '', spans: [], entities: [] }
  const spans = []
  for (const mt of buildMatchers()) {
    let m
    mt.re.lastIndex = 0
    while ((m = mt.re.exec(text))) {
      const value = m[0]
      const digits = value.replace(/[\s-]/g, '')
      if (mt.min && (digits.length < mt.min || digits.length > mt.max)) continue
      const start = m.index
      const end = start + value.length
      if (overlaps(start, end, spans)) continue
      spans.push({ start, end, type: mt.type, value, conf: mt.conf })
    }
  }
  for (const n of findNames(text, spans)) {
    spans.push({ start: n.start, end: n.end, type: 'PERSON', value: n.value, conf: 95 })
  }
  spans.sort((a, b) => a.start - b.start)

  // 生成脱敏文本
  let masked = ''
  let cursor = 0
  for (const sp of spans) {
    masked += text.slice(cursor, sp.start) + maskValue(sp.type, sp.value)
    cursor = sp.end
  }
  masked += text.slice(cursor)

  // 实体汇总
  const byType = {}
  for (const sp of spans) {
    if (!byType[sp.type]) byType[sp.type] = { type: sp.type, count: 0, conf: sp.conf }
    byType[sp.type].count += 1
  }
  const entities = Object.values(byType).map((e) => ({
    en: e.type,
    ...ENTITY_META[e.type],
    count: `${e.count} 处`,
    conf: `${e.conf}%`,
  }))

  return { masked, spans, entities, total: spans.length }
}

export const SAMPLE_TEXT =
  '兹证明，张伟 与本公司签订劳动合同，身份证号 310101199003074512，手机 138-0013-8000，' +
  '月薪人民币 25,000 元，工资发放至银行账户 6222 0212 3456 7890 123，' +
  '现住 上海市浦东新区世纪大道100号。紧急联系人 李娜，电话 139-0021-7788，邮箱 lina@example.com。'
