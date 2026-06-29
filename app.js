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

const diagnosisGrid = document.querySelector("#diagnosisGrid");
const contentPlan = document.querySelector("#contentPlan");
const fullReport = document.querySelector("#fullReport");
const toast = document.querySelector("#toast");

let latestReport = "";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[char]);
}

function fieldValue(key) {
  return fields[key].value.trim() || defaults[key];
}

function getData() {
  return Object.fromEntries(Object.keys(fields).map((key) => [key, fieldValue(key)]));
}

function showToast(message) {
  toast.textContent = message;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.textContent = "";
  }, 1800);
}

function scoreFromData(data) {
  let score = 68;
  if (data.audience.length > 20) score += 8;
  if (data.pain.length > 12) score += 8;
  if (data.product.length > 4) score += 6;
  if (data.platform !== "朋友圈") score += 5;
  return Math.min(score, 95);
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

function buildWechatPackage(data) {
  const topic = document.querySelector("#wechatTopic").value.trim() || `${data.product}到底适合哪些人`;
  const goal = document.querySelector("#wechatGoal").value;
  const material = document.querySelector("#wechatMaterial").value.trim() || `${data.pain}；客户想知道效果、安全感和价格是否值得。`;
  return [
    `公众号发布包：${topic}`,
    "",
    `门店：${data.name}`,
    `发布目标：${goal}`,
    "",
    "推荐标题：",
    `1. ${topic}，做之前先看这篇`,
    `2. ${data.city}${data.industry}客户最常问的5个问题`,
    `3. 别急着做${data.product}，先判断你适不适合`,
    "",
    "文章结构：",
    `开头：点出客户痛点：${data.pain}`,
    `正文一：解释${data.product}适合的人群、解决的问题和风险边界。`,
    `正文二：结合素材：${material}`,
    "正文三：用真实案例/过程说明建立信任。",
    "结尾：引导评论或私信领取AI项目适配诊断。",
    "",
    "摘要：",
    `${data.audience}在选择${data.product}前，最需要先搞清楚适不适合、能解决什么问题、有哪些注意事项。`,
    "",
    "封面建议：",
    "人物半身照 + 项目关键词 + 一句痛点标题，例如“抗衰前先做适配诊断”。",
    "",
    "待发布清单：",
    "检查合规措辞、添加门店联系方式、同步朋友圈、准备私信承接话术。",
  ].join("\n");
}

function buildImageVideoPackage(data) {
  const imageName = document.querySelector("#imageFile").files[0]?.name || "未上传图片";
  const audioName = document.querySelector("#imageAudio").files[0]?.name || "未上传声音";
  const copy = document.querySelector("#imageCopy").value.trim() || `客户担心${data.product}有没有效果，先用AI诊断判断适不适合。`;
  return [
    "图片生成短视频发布包",
    "",
    `图片素材：${imageName}`,
    `声音素材：${audioName}`,
    `平台：${data.platform}`,
    "",
    "15-30秒脚本：",
    `3秒开头：${data.city}想做${data.product}的姐妹，先别急着下单。`,
    `中段内容：${copy}`,
    "信任证明：展示门店环境、老师专业动作、客户反馈或项目过程。",
    "结尾引导：评论“诊断”或私信，领取你的轻抗衰项目适配建议。",
    "",
    "字幕节奏：",
    "第1屏：别急着做项目",
    "第2屏：先判断适不适合",
    `第3屏：${data.product}适合哪些人`,
    "第4屏：扫码/私信领取AI诊断",
    "",
    "发布文案：",
    `${data.industry}不是硬推项目，而是先帮客户判断适不适合。想要诊断，评论“抗衰诊断”。`,
    "",
    "封面标题：",
    `做${data.product}前，先看你适不适合`,
  ].join("\n");
}

function buildLongVideoPackage(data) {
  const videoName = document.querySelector("#shortVideoFile").files[0]?.name || "未上传短视频";
  const audioName = document.querySelector("#longVideoAudio").files[0]?.name || "未上传声音";
  const copy = document.querySelector("#longVideoCopy").value.trim() || `把30秒素材扩展成客户能看懂、能信任、愿意咨询的长视频。`;
  return [
    "30秒短视频扩写长视频方案",
    "",
    `短视频素材：${videoName}`,
    `声音素材：${audioName}`,
    `扩写方向：${copy}`,
    "",
    "1-3分钟长视频结构：",
    `开场钩子：为什么很多人做${data.product}前，最该先做适配诊断？`,
    "第一段：拆解客户常见误区，不是所有人都适合直接做项目。",
    `第二段：解释${data.product}适合人群、过程、注意事项和效果边界。`,
    "第三段：用案例/门店过程/老师讲解补足信任。",
    "第四段：给出行动引导，评论或私信领取AI诊断。",
    "",
    "分镜建议：",
    "镜头1：保留原30秒视频最有吸引力的3-5秒作为开头。",
    "镜头2：加入老师讲解或字幕解释。",
    "镜头3：加入过程、环境、仪器、案例细节。",
    "镜头4：结尾放领取口令和私域承接动作。",
    "",
    "爆款标题：",
    `1. ${data.city}做${data.product}前，先搞清楚这3点`,
    `2. 客户嫌贵之前，先让她看懂${data.product}`,
    "3. 轻抗衰不是越贵越好，适合才重要",
  ].join("\n");
}

function renderTextResult(targetId, content) {
  document.querySelector(`#${targetId}`).innerHTML = `<pre>${escapeHtml(content)}</pre>`;
  showToast("结果已生成");
  generate();
}

function renderDiagnosis(items) {
  diagnosisGrid.innerHTML = items.map((item, index) => `
    <article class="deliverable-card">
      <div class="card-top">
        <span class="num">${index + 1}</span>
        <span class="status">已生成</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <ul>${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function renderContentPlan(data) {
  const topics = buildTopics(data);
  const plan = buildThirtyDayPlan(data);
  contentPlan.innerHTML = `
    <article class="day">
      <h3>短视频选题库</h3>
      <ul>${topics.map((topic) => `<li>${escapeHtml(topic)}</li>`).join("")}</ul>
    </article>
    <article class="day">
      <h3>30天执行计划</h3>
      <ul>${plan.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </article>
  `;
}

function buildReport(data, diagnosis) {
  const wechat = document.querySelector("#wechatOutput").innerText.trim();
  const image = document.querySelector("#imageOutput").innerText.trim();
  const longVideo = document.querySelector("#longVideoOutput").innerText.trim();
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
    "一、获客诊断",
    ...diagnosis.flatMap((item, index) => [
      "",
      `${index + 1}. ${item.title}`,
      item.summary,
      ...item.bullets.map((bullet) => `- ${bullet}`),
    ]),
    "",
    "二、30天执行计划",
    ...buildThirtyDayPlan(data).map((item) => `- ${item}`),
    "",
    "三、三大功能生成结果",
    "",
    wechat || "公众号发布包：暂未生成",
    "",
    image || "图片短视频发布包：暂未生成",
    "",
    longVideo || "长视频方案：暂未生成",
  ].join("\n");
}

function generate() {
  const data = getData();
  const diagnosis = buildDiagnosis(data);
  renderDiagnosis(diagnosis);
  renderContentPlan(data);
  latestReport = buildReport(data, diagnosis);
  fullReport.value = latestReport;
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

function activateTool(toolName) {
  activateTab("tools");
  document.querySelectorAll(".tool-tab").forEach((item) => {
    item.classList.toggle("active", item.dataset.tool === toolName);
  });
  document.querySelectorAll(".tool-panel").forEach((item) => {
    item.classList.toggle("active", item.id === `tool-${toolName}`);
  });
  document.querySelector(`#tool-${toolName}`)?.scrollIntoView({behavior: "smooth", block: "start"});
}

function downloadReport() {
  generate();
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

async function copyText(content, fallbackElement) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
    } else if (fallbackElement) {
      fallbackElement.focus();
      document.execCommand("selectAll");
      document.execCommand("copy");
    }
    showToast("已复制");
  } catch (error) {
    showToast("复制失败，请长按文本手动复制");
  }
}

function setupPreview(inputId, previewId) {
  const input = document.querySelector(`#${inputId}`);
  const preview = document.querySelector(`#${previewId}`);
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = "block";
  });
}

document.querySelector("#fillDemo").addEventListener("click", () => {
  Object.entries(defaults).forEach(([key, item]) => {
    fields[key].value = item;
  });
  document.querySelector("#wechatTopic").value = "轻抗衰项目到底适合哪些人";
  document.querySelector("#wechatMaterial").value = "客户怕没效果、怕不安全、怕花钱踩坑，需要先做项目适配诊断。";
  document.querySelector("#imageCopy").value = "做轻抗衰之前，先判断自己的状态和需求，不要盲目跟风。";
  document.querySelector("#longVideoCopy").value = "从客户痛点讲到项目适配，再讲案例和私域领取诊断。";
  generate();
  showToast("示例已填入");
});

document.querySelector("#generate").addEventListener("click", () => {
  generate();
  activateTab("diagnosis");
  showToast("获客方案已更新");
});

document.querySelector("#runWechat").addEventListener("click", () => {
  renderTextResult("wechatOutput", buildWechatPackage(getData()));
});

document.querySelector("#runImageVideo").addEventListener("click", () => {
  renderTextResult("imageOutput", buildImageVideoPackage(getData()));
});

document.querySelector("#runLongVideo").addEventListener("click", () => {
  renderTextResult("longVideoOutput", buildLongVideoPackage(getData()));
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
});

document.querySelectorAll("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => activateTool(button.dataset.tool));
});

document.querySelectorAll(".copy-tool").forEach((button) => {
  button.addEventListener("click", () => {
    const output = document.querySelector(`#${button.dataset.output}`);
    copyText(output.innerText.trim(), output);
  });
});

document.querySelector("#copyAll").addEventListener("click", () => {
  generate();
  copyText(latestReport, fullReport);
});

document.querySelector("#downloadAll").addEventListener("click", downloadReport);

setupPreview("imageFile", "imagePreview");
setupPreview("imageAudio", "imageAudioPreview");
setupPreview("shortVideoFile", "shortVideoPreview");
setupPreview("longVideoAudio", "longVideoAudioPreview");

generate();
