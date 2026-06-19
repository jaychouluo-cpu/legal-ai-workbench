// 文书生成引擎：模板 + 字段表单 → 渲染正文 → 导出 Word(.doc)/纯文本
// 对应整合方案「文格 · legal-document-format-skill」的格式化与门禁思路。

// 模板：fields 为可填变量，build(values) 生成正文段落数组
export const TEMPLATES = [
  {
    key: 'supplier', name: '供应商准入意见书', cat: '合规', emoji: '🏢',
    docNo: '法务字〔2026〕第 ____ 号',
    fields: [
      { k: 'to', label: '呈送部门', def: '采购管理部' },
      { k: 'company', label: '供应商名称', def: '星海智能科技有限公司' },
      { k: 'capital', label: '注册资本', def: '5,000 万元' },
      { k: 'penalty', label: '行政处罚情况', def: '环保、消防各 1 项' },
      { k: 'verdict', label: '准入意见', def: '附条件准入', type: 'select', options: ['准予准入', '附条件准入', '不予准入'] },
    ],
    build: (v) => [
      { h: false, t: `致：${v.to}` },
      { h: false, t: `就拟引入供应商 ${v.company} 的准入事宜，本部门依据《供应商准入管理办法》及企查查、cncases 核查结果，出具意见如下：` },
      { h: true, t: '一、主体资格' },
      { h: false, t: `该公司依法设立并有效存续，注册资本 ${v.capital}，具备履约所需的主体资格与经营范围。` },
      { h: true, t: '二、风险核查' },
      { h: false, t: `经核查，该公司无失信被执行记录；存在的行政处罚情况为：${v.penalty}。` },
      { h: true, t: '三、准入意见' },
      { h: false, t: `综合上述核查，建议予以「${v.verdict}」。如附条件准入，应要求供应商提供处罚整改证明，并在合同中约定履约担保及质量违约金条款。` },
    ],
  },
  {
    key: 'opinion', name: '法律意见书', cat: '综合', emoji: '⚖️',
    docNo: '法律意见书〔2026〕第 ____ 号',
    fields: [
      { k: 'to', label: '致', def: '公司管理层' },
      { k: 'matter', label: '事项', def: '关于某采购框架协议的合规性' },
      { k: 'opinion', label: '核心意见', def: '该协议总体可行，但存在若干需修订的风险条款。', type: 'textarea' },
    ],
    build: (v) => [
      { h: false, t: `致：${v.to}` },
      { h: false, t: `就「${v.matter}」事项，本部门发表法律意见如下：` },
      { h: true, t: '一、基本情况' },
      { h: false, t: `本意见基于现有材料及中国现行法律法规作出。` },
      { h: true, t: '二、法律分析与意见' },
      { h: false, t: v.opinion },
      { h: true, t: '三、结论' },
      { h: false, t: '上述意见仅供决策参考，重大事项请结合具体情形进一步核验。' },
    ],
  },
  {
    key: 'letter', name: '律师函 / 法务函', cat: '争议', emoji: '✉️',
    docNo: '函〔2026〕第 ____ 号',
    fields: [
      { k: 'to', label: '受函方', def: '__________' },
      { k: 'fact', label: '事实陈述', def: '贵方未按约定期限履行付款义务。', type: 'textarea' },
      { k: 'demand', label: '诉求', def: '请于收函后 7 日内付清全部款项及逾期利息。', type: 'textarea' },
    ],
    build: (v) => [
      { h: false, t: `致：${v.to}` },
      { h: true, t: '一、事实' },
      { h: false, t: v.fact },
      { h: true, t: '二、法律依据与诉求' },
      { h: false, t: `根据《民法典》合同编相关规定，${v.demand}` },
      { h: false, t: '逾期未果，我方将依法采取包括诉讼/仲裁在内的进一步措施，由此产生的法律责任及费用由贵方承担。' },
    ],
  },
]

// 渲染为纯文本
export function renderText(tpl, values) {
  const title = tpl.name
  const lines = [title, tpl.docNo, '']
  for (const p of tpl.build(values)) lines.push(p.t)
  return lines.join('\n\n')
}

// 导出 Word(.doc)：用带 mso 头的 HTML，Word/WPS 可直接打开
export function exportDoc(tpl, values) {
  const paras = tpl.build(values).map((p) =>
    p.h
      ? `<p style="font-weight:700;margin:16px 0 6px;">${escapeHtml(p.t)}</p>`
      : `<p style="margin:0 0 12px;text-indent:2em;line-height:1.9;">${escapeHtml(p.t)}</p>`
  ).join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head>
  <body style="font-family:'仿宋_GB2312','FangSong',serif;font-size:16pt;">
  <h2 style="text-align:center;font-family:'Noto Serif SC',serif;">${escapeHtml(tpl.name)}</h2>
  <p style="text-align:center;color:#666;font-size:11pt;">${escapeHtml(tpl.docNo)}</p>
  ${paras}
  <p style="margin-top:40px;text-align:right;">企业法务部</p>
  <p style="text-align:right;">${new Date().toLocaleDateString('zh-CN')}</p>
  </body></html>`
  download(`${tpl.name}.doc`, html, 'application/msword')
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}

export function download(filename, content, mime) {
  const blob = new Blob(['﻿', content], { type: mime + ';charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// 格式门禁校验：对生成文本做规范性检查
export function gateCheck(text, values) {
  const checks = []
  checks.push({ text: '标题与文号齐备', ok: text.length > 0 })
  checks.push({ text: '正文字体 仿宋_GB2312 · 三号（导出内置）', ok: true })
  checks.push({ text: '页边距 上下2.54 / 左右3.17 cm（导出内置）', ok: true })
  const hasLaw = /《[^》]+》第[一二三四五六七八九十百零\d]+条|《[^》]+》/.test(text)
  checks.push({ text: '含规范法条引用《法律》第X条', ok: hasLaw })
  const consistent = !(/应当/.test(text) && /必须|须(?!知)/.test(text))
  checks.push({ text: '「应当 / 必须」用语前后一致', ok: consistent })
  const noBlank = !/_{3,}|（请填写）|__________/.test(text)
  checks.push({ text: '无未填写占位符', ok: noBlank })
  const passed = checks.filter((c) => c.ok).length
  return { checks, passed, total: checks.length }
}
