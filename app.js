const fields = {
  name: document.querySelector("#name"),
  industry: document.querySelector("#industry"),
  product: document.querySelector("#product"),
  audience: document.querySelector("#audience"),
  pain: document.querySelector("#pain"),
  city: document.querySelector("#city"),
  price: document.querySelector("#price"),
  platform: document.querySelector("#platform"),
  goal: document.querySelector("#goal"),
};

const defaults = {
  name: "悦容轻抗衰管理中心",
  industry: "美业轻抗衰",
  product: "喷射抗衰提升项目",
  audience: "35-55岁，怕显老、重视状态、愿意为效果和安全感付费的本地女性",
  pain: "不会拍短视频，客户嫌项目贵，到店咨询少，朋友圈信任感弱",
  city: "杭州",
  price: "1280",
  platform: "视频号",
  goal: "30天拿到30个咨询，成交10个体验客户",
};

const platformGrid = document.querySelector("#platformGrid");
const diagnosisGrid = document.querySelector("#diagnosisGrid");
const contentPlan = document.querySelector("#contentPlan");
const fullReport = document.querySelector("#fullReport");
const toast = document.querySelector("#toast");

let latestReport = "";

function text(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[char]);
}

function value(key) {
  return fields[key].value.trim() || defaults[key];
}

function getData() {
  return Object.fromEntries(Object.keys(fields).map((key) => [key, value(key)]));
}

function scoreFromData(data) {
  let score = 68;
  if (data.audience.length > 20) score += 8;
  if (data.pain.length > 12) score += 8;
  if (data.product.length > 4) score += 6;
  if (data.platform !== "朋友圈") score += 5;
  return Math.min(score, 95);
}

function buildPlatform(data) {
  return [
    {
      title: "公众号自动发布平台",
      tag: "图文种草 + 信任沉淀",
      summary: `围绕${data.product}生成公众号文章、摘要、封面建议和发布计划，适合沉淀专业信任。`,
      inputs: ["文章主题", "项目卖点", "客户痛点", "案例素材", "发布账号"],
      outputs: ["公众号文章", "摘要", "标题", "封面建议", "待发布清单"],
      sop: [
        "选择主题：抗衰误区、项目避坑、案例故事、到店前必看。",
        "生成文章：按痛点、解释、案例、行动引导四段输出。",
        "人工确认：检查项目表述、合规措辞和门店联系方式。",
        "进入待发布：记录发布时间、平台状态和发布负责人。",
      ],
    },
    {
      title: "图片 + 声音 + 文案生成短视频",
      tag: "一张图变可发短视频",
      summary: `上传门店、项目、顾客状态或老师形象图片，配合声音和文案，生成${data.platform}可发布竖屏短视频方案。`,
      inputs: ["1张图片", "1段声音", "口播文案", "封面标题", "行动引导"],
      outputs: ["15-30秒短视频方案", "字幕", "封面文案", "发布文案", "评论区引导"],
      sop: [
        "上传图片：门店环境、项目仪器、老师形象、客户案例图均可。",
        "上传声音：真人音色、品牌音色或课程讲解音频。",
        "填写文案：开头钩子、核心内容、结尾引导。",
        "生成方案：输出竖屏视频结构、字幕和发布文案。",
      ],
    },
    {
      title: "30秒短视频生成爆款长视频",
      tag: "短素材扩成长内容",
      summary: "上传一段30秒短视频，再加声音和文案，扩展成更完整的爆款长视频脚本与制作方案。",
      inputs: ["30秒短视频", "声音素材", "扩写文案", "目标平台", "转化口令"],
      outputs: ["1-3分钟长视频脚本", "分镜结构", "字幕节奏", "爆款标题", "私域引导"],
      sop: [
        "上传短视频：优先选择案例、讲解、门店过程、客户反馈素材。",
        "拆解亮点：识别开头、情绪点、证明点和转化点。",
        "扩写长视频：补充背景、过程、案例、风险边界和行动引导。",
        "生成发布包：标题、封面、字幕、评论区和私域承接话术。",
      ],
    },
  ];
}

function buildDiagnosis(data) {
  const score = scoreFromData(data);
  return [
    {
      title: "获客诊断结论",
      summary: `当前获客成熟度：${score}分。${data.name}适合用“痛点诊断 + 效果解释 + 案例信任 + 私域领取方案”的结构获客。`,
      bullets: [
        `核心卡点：${data.pain}`,
        `先不要直接卖${data.product}，先让客户相信你能解决她的状态焦虑和安全顾虑。`,
        `建议入口：${data.platform}短视频 + 公众号专业文章 + 微信私域诊断。`,
      ],
    },
    {
      title: "精准客户画像",
      summary: `目标客户是：${data.audience}。她们买的不是项目本身，而是状态变好、变年轻、被理解和更安心。`,
      bullets: [
        "关注点：效果、安全感、是否适合自己、别人做完的真实反馈。",
        "顾虑点：怕无效、怕踩坑、怕被强推、怕价格不透明。",
        "成交触发：真实案例、过程解释、适合人群说明、风险边界说明。",
      ],
    },
    {
      title: "行业AI钩子",
      summary: `推荐钩子：${data.industry}AI项目适配诊断。用免费诊断承接短视频和公众号流量。`,
      bullets: [
        "客户输入：年龄、皮肤/状态问题、预算、所在城市、最担心的问题。",
        `AI输出：是否适合${data.product}、当前状态分析、内容建议、到店咨询建议。`,
        "引导口令：评论“抗衰诊断”或扫码，领取专属项目适配方案。",
      ],
    },
  ];
}

function buildTopics(data) {
  return [
    `为什么很多${data.industry}门店发视频没人咨询？`,
    `客户嫌${data.product}贵，通常不是价格问题。`,
    `${data.audience}最怕的不是变老，而是不知道自己适不适合。`,
    `做${data.product}之前，一定要先弄清楚这3件事。`,
    "别再只拍环境了，客户真正想看的是变化和过程。",
    `一个${data.city}${data.industry}门店，怎么用${data.platform}拿咨询？`,
    "客户问“有没有效果”，你应该怎么回答？",
    "朋友圈怎么发，才能让客户觉得你专业又可信？",
  ];
}

function buildVideoScripts(data) {
  return [
    {
      title: "痛点诊断型短视频",
      hook: `${data.city}${data.industry}老板注意：你不是缺项目，是缺一个让客户主动问诊断的钩子。`,
      body: `很多门店一上来就讲${data.product}多好，但客户真正关心的是自己适不适合、有没有风险、做完能不能看见变化。先讲痛点，再讲判断标准，最后引导她领取AI适配诊断。`,
      cta: "评论“抗衰诊断”，领取项目适配建议。",
    },
    {
      title: "价格异议型短视频",
      hook: `客户觉得${data.price}贵，不是她没钱，是她还没看懂为什么值。`,
      body: `把${data.product}拆成适合人群、解决问题、过程体验、效果边界和注意事项，客户才会有安全感。内容不是为了炫技术，而是为了让客户放心。`,
      cta: "想知道你的项目怎么讲客户更容易懂，扫码做一次AI获客诊断。",
    },
    {
      title: "信任案例型短视频",
      hook: "轻抗衰内容不要只拍设备，客户想看的是“我做了会不会也有变化”。",
      body: "案例内容要讲清楚：她原来困扰什么、为什么选择这个方案、过程怎么做、做完有哪些反馈、哪些人不建议做。这样客户才不会觉得你在硬广。",
      cta: "评论“案例”，领取一套美业案例短视频模板。",
    },
  ];
}

function buildThirtyDayPlan(data) {
  return [
    "第1-3天：发布定位声明、痛点诊断、抗衰误区，测试客户最关注什么。",
    `第4-7天：发布案例信任、${data.product}解释、公众号专业文章、诊断引流视频。`,
    "第8-14天：复拍高互动选题，每天1条短视频 + 1条朋友圈信任内容。",
    "第15-21天：发布客户答疑、价格异议、真实案例、专业长文，建立专家信任。",
    "第22-27天：集中做私域跟进，按客户状态发送诊断、案例、邀约话术。",
    "第28-30天：复盘播放、评论、私信、加微、预约、成交，生成下一轮内容计划。",
  ];
}

function renderPlatform(items) {
  platformGrid.innerHTML = items.map((item, index) => `
    <article class="platform-card">
      <div class="card-top">
        <span class="num">${index + 1}</span>
        <span class="status">${text(item.tag)}</span>
      </div>
      <h3>${text(item.title)}</h3>
      <p>${text(item.summary)}</p>
      <div class="mini-grid">
        <div>
          <b>输入</b>
          <ul>${item.inputs.map((input) => `<li>${text(input)}</li>`).join("")}</ul>
        </div>
        <div>
          <b>输出</b>
          <ul>${item.outputs.map((output) => `<li>${text(output)}</li>`).join("")}</ul>
        </div>
      </div>
      <div class="session">
        <strong>执行SOP</strong>
        <ul>${item.sop.map((step) => `<li>${text(step)}</li>`).join("")}</ul>
      </div>
    </article>
  `).join("");
}

function renderDiagnosis(items) {
  diagnosisGrid.innerHTML = items.map((item, index) => `
    <article class="deliverable-card">
      <div class="card-top">
        <span class="num">${index + 1}</span>
        <span class="status">已生成</span>
      </div>
      <h3>${text(item.title)}</h3>
      <p>${text(item.summary)}</p>
      <ul>${item.bullets.map((bullet) => `<li>${text(bullet)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function renderContentPlan(data) {
  const topics = buildTopics(data);
  const scripts = buildVideoScripts(data);
  const plan = buildThirtyDayPlan(data);
  contentPlan.innerHTML = `
    <article class="day">
      <h3>短视频选题库</h3>
      <ul>${topics.map((topic) => `<li>${text(topic)}</li>`).join("")}</ul>
    </article>
    <article class="day">
      <h3>3条可发布脚本</h3>
      ${scripts.map((script) => `
        <div class="session">
          <strong>${text(script.title)}</strong>
          <p><b>开头：</b>${text(script.hook)}</p>
          <p><b>正文：</b>${text(script.body)}</p>
          <p><b>引导：</b>${text(script.cta)}</p>
        </div>
      `).join("")}
    </article>
    <article class="day">
      <h3>30天内容执行计划</h3>
      <ul>${plan.map((item) => `<li>${text(item)}</li>`).join("")}</ul>
    </article>
  `;
}

function buildReport(data, platform, diagnosis) {
  const topics = buildTopics(data);
  const scripts = buildVideoScripts(data);
  const plan = buildThirtyDayPlan(data);
  return [
    "美业大健康AI获客中控台方案",
    "",
    `门店：${data.name}`,
    `行业：${data.industry}`,
    `项目：${data.product}`,
    `城市：${data.city}`,
    `平台：${data.platform}`,
    `目标：${data.goal}`,
    "",
    "一、三大核心功能",
    ...platform.flatMap((item, index) => [
      "",
      `${index + 1}. ${item.title}`,
      item.summary,
      `输入：${item.inputs.join("、")}`,
      `输出：${item.outputs.join("、")}`,
      ...item.sop.map((step) => `- ${step}`),
    ]),
    "",
    "二、获客诊断",
    ...diagnosis.flatMap((item, index) => [
      "",
      `${index + 1}. ${item.title}`,
      item.summary,
      ...item.bullets.map((bullet) => `- ${bullet}`),
    ]),
    "",
    "三、短视频选题",
    ...topics.map((topic, index) => `${index + 1}. ${topic}`),
    "",
    "四、可发布脚本",
    ...scripts.flatMap((script, index) => [
      "",
      `${index + 1}. ${script.title}`,
      `开头：${script.hook}`,
      `正文：${script.body}`,
      `引导：${script.cta}`,
    ]),
    "",
    "五、30天执行计划",
    ...plan.map((item) => `- ${item}`),
  ].join("\n");
}

function showToast(message) {
  toast.textContent = message;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.textContent = "";
  }, 1800);
}

function activateTab(tabName) {
  document.querySelectorAll(".tab").forEach((item) => {
    item.classList.toggle("active", item.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((item) => {
    item.classList.toggle("active", item.id === tabName);
  });
  document.querySelector(`#${tabName}`)?.scrollIntoView({behavior: "smooth", block: "start"});
}

function generate() {
  const data = getData();
  const platform = buildPlatform(data);
  const diagnosis = buildDiagnosis(data);
  latestReport = buildReport(data, platform, diagnosis);
  renderPlatform(platform);
  renderDiagnosis(diagnosis);
  renderContentPlan(data);
  fullReport.value = latestReport;
  showToast("方案已生成");
}

function downloadReport() {
  if (!latestReport) generate();
  const blob = new Blob([latestReport], {type: "text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "美业大健康AI获客中控台方案.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("TXT已开始下载");
}

async function copyReport() {
  if (!latestReport) generate();
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(latestReport);
    } else {
      fullReport.focus();
      fullReport.select();
      document.execCommand("copy");
    }
    showToast("已复制完整方案");
  } catch (error) {
    fullReport.focus();
    fullReport.select();
    showToast("已选中文本，可手动复制");
  }
}

document.querySelector("#fillDemo").addEventListener("click", () => {
  Object.entries(defaults).forEach(([key, item]) => {
    fields[key].value = item;
  });
  generate();
});

document.querySelector("#generate").addEventListener("click", () => {
  generate();
  activateTab("platform");
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
});

document.querySelector("#copyAll").addEventListener("click", copyReport);
document.querySelector("#downloadAll").addEventListener("click", downloadReport);

generate();
