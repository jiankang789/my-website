const roleData = {
  规划铁军: {
    title: "规划铁军",
    text: "负责明确战略方向、目标客户、产品结构、阶段目标和资源调度，先把老板脑子里的经验变成可执行路线图。",
  },
  开发铁军: {
    title: "开发铁军",
    text: "负责把表单、知识库、工作台、自动化流程和演示工具搭起来，让AI能力不只停留在聊天窗口。",
  },
  产品铁军: {
    title: "产品铁军",
    text: "负责梳理卖点、套餐、价格梯度、体验路径和升单逻辑，让客户听得懂、门店交付稳。",
  },
  流量铁军: {
    title: "流量铁军",
    text: "负责把老板经验和产品卖点拆成短视频选题、口播脚本、直播预热、朋友圈内容和同城引流动作。",
  },
  私域铁军: {
    title: "私域铁军",
    text: "负责资料包、私信回复、社群内容、客户标签和跟进节奏，把公域流量沉淀到可长期经营的客户池。",
  },
  成交铁军: {
    title: "成交铁军",
    text: "负责诊断话术、异议处理、报价策略和追单节奏，用顾问式沟通提高咨询转化率。",
  },
  交付铁军: {
    title: "交付铁军",
    text: "负责把服务步骤、客户建档、回访提醒、体验反馈和复购节点整理成标准SOP。",
  },
  赋能铁军: {
    title: "赋能铁军",
    text: "负责训练员工、代理和合作门店，输出陪练脚本、考核题、操作清单和复盘建议。",
  },
  资产铁军: {
    title: "资产铁军",
    text: "负责沉淀案例、素材、话术、提示词、海报和知识库，把一次经验变成企业资产。",
  },
  数据铁军: {
    title: "数据铁军",
    text: "负责追踪曝光、互动、加微、咨询、成交和复购数据，帮老板找到增长链路里的缺口。",
  },
  品牌铁军: {
    title: "品牌铁军",
    text: "负责统一人设、主张、视觉、内容栏目和信任背书，让客户记得住、愿意信。",
  },
  增长铁军: {
    title: "增长铁军",
    text: "负责活动、复购、老客激活、会员升级和新增渠道测试，让系统持续产生结果。",
  },
  裂变铁军: {
    title: "裂变铁军",
    text: "负责转介绍、代理机制、分享素材和客户带客户路径，把一次成交延伸成更多线索。",
  },
};

const caseImages = [
  {
    src: "./assets/case-zhenlisu-growth-1.png",
    alt: "榛栗塑招商海报：缺客户获客版",
  },
  {
    src: "./assets/case-zhenlisu-growth-2.png",
    alt: "榛栗塑招商海报：三核竞争力版",
  },
  {
    src: "./assets/case-zhenlisu-growth-3.png",
    alt: "榛栗塑招商海报：增长闭环版",
  },
];

const painPointPlans = {
  缺内容: {
    roles: ["流量铁军", "品牌铁军", "资产铁军"],
    actions: ["整理20个客户真实问题", "生成30条安全选题", "做3条老板IP置顶视频脚本"],
  },
  缺线索: {
    roles: ["流量铁军", "私域铁军", "数据铁军"],
    actions: ["重新设计评论引导词", "设置资料包私信承接", "统计每条内容的加微来源"],
  },
  成交弱: {
    roles: ["成交铁军", "产品铁军", "私域铁军"],
    actions: ["梳理3档产品方案", "建立20句异议回复", "设计轻邀约到店/咨询路径"],
  },
  交付乱: {
    roles: ["交付铁军", "赋能铁军", "资产铁军"],
    actions: ["拆出标准服务步骤", "建立客户建档和回访表", "训练员工按SOP复述方案"],
  },
  表达怕违规: {
    roles: ["品牌铁军", "产品铁军", "资产铁军"],
    actions: ["列出高风险表达清单", "替换成合规生活化话术", "给每条素材加底部风险提示"],
  },
};

const audienceAngles = {
  传统实体老板: {
    pain: "不是产品不好，而是获客、内容、私域和成交都靠老板自己硬扛",
    method: "先把每天重复的选题、回复、邀约和复盘动作交给AI智能体",
    tone: "直接一点，像跟老板坐下来算账",
  },
  美业门店老板: {
    pain: "不是技术不行，而是不会持续发内容、不会安全表达、不会把咨询转成到店",
    method: "先做安全选题、顾问式私信回复和老客复购提醒",
    tone: "专业、亲和，不制造焦虑，不夸大效果",
  },
  想做AI副业的人: {
    pain: "不是缺工具，而是没有选准人群、没有交付物、没有成交路径",
    method: "先从一个行业切入，做资料包、脚本库和诊断服务",
    tone: "给方向，也给可执行的第一步",
  },
  项目招商负责人: {
    pain: "不是缺项目卖点，而是缺一套让渠道商听懂、门店能落地的招商系统",
    method: "把项目定位、三档合作、门店SOP、内容素材和合规话术打包",
    tone: "招商感强，但不夸张承诺",
  },
};

function copyText(text, button, label) {
  const reset = () => {
    button.textContent = "已复制";
    setTimeout(() => {
      button.textContent = label;
    }, 1400);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(reset).catch(() => fallbackCopy(text, reset));
  } else {
    fallbackCopy(text, reset);
  }
}

function fallbackCopy(text, callback) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  callback();
}

function setMobileMenu(open) {
  const button = document.querySelector("#menuButton");
  const nav = document.querySelector("#mobileNav");
  if (!button || !nav) return;

  button.setAttribute("aria-expanded", String(open));
  nav.hidden = !open;
  document.body.classList.toggle("menu-open", open);
}

function initMobileNav() {
  const button = document.querySelector("#menuButton");
  const nav = document.querySelector("#mobileNav");
  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    setMobileMenu(!isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMobileMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      setMobileMenu(false);
    }
  });
}

function initRoleSwitcher() {
  const buttons = document.querySelectorAll("#armyGrid button");
  const panel = document.querySelector("#rolePanel");
  if (!buttons.length || !panel) return;

  const title = panel.querySelector("h3");
  const text = panel.querySelector("p:last-child");

  function selectRole(role) {
    const data = roleData[role] || roleData.流量铁军;
    title.textContent = data.title;
    text.textContent = data.text;
    buttons.forEach((button) => button.classList.toggle("active", button.dataset.role === role));
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => selectRole(button.dataset.role));
  });

  selectRole("流量铁军");
}

function initCaseCarousel() {
  const image = document.querySelector("#caseImage");
  const prev = document.querySelector("#prevCase");
  const next = document.querySelector("#nextCase");
  if (!image || !prev || !next) return;

  let index = 0;

  function render() {
    const current = caseImages[index];
    image.src = current.src;
    image.alt = current.alt;
  }

  prev.addEventListener("click", () => {
    index = (index - 1 + caseImages.length) % caseImages.length;
    render();
  });

  next.addEventListener("click", () => {
    index = (index + 1) % caseImages.length;
    render();
  });
}

function getDiagnosisText(business, painPoint, offer) {
  const plan = painPointPlans[painPoint] || painPointPlans.缺内容;
  const offerText = offer ? `，主推“${offer}”` : "";
  return {
    headline: `${business}${offerText}，当前应优先解决“${painPoint}”。`,
    summary: `建议先启动${plan.roles.join("、")}，用7天完成第一轮诊断、内容和承接动作，再把有效话术沉淀成可复制SOP。`,
    actions: plan.actions,
    roles: plan.roles,
  };
}

function initLeadForm() {
  const form = document.querySelector("#leadForm");
  const text = document.querySelector("#diagnosisText");
  const list = document.querySelector("#diagnosisList");
  const copyButton = document.querySelector("#copyDiagnosis");
  if (!form || !text || !list || !copyButton) return;

  let currentCopy = text.textContent.trim();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const business = document.querySelector("#businessType").value.trim() || "你的业务";
    const painPoint = document.querySelector("#painPoint").value;
    const offer = document.querySelector("#mainOffer").value.trim();
    const diagnosis = getDiagnosisText(business, painPoint, offer);

    text.textContent = `${diagnosis.headline}${diagnosis.summary}`;
    list.innerHTML = "";

    diagnosis.roles.forEach((role) => {
      const item = document.createElement("li");
      item.textContent = `优先分身：${role}`;
      list.appendChild(item);
    });

    diagnosis.actions.forEach((action) => {
      const item = document.createElement("li");
      item.textContent = `7天动作：${action}`;
      list.appendChild(item);
    });

    currentCopy = [
      "【唐曾说AI.Cotex智能体铁军诊断卡】",
      diagnosis.headline,
      diagnosis.summary,
      `优先分身：${diagnosis.roles.join("、")}`,
      `7天动作：${diagnosis.actions.join("；")}`,
    ].join("\n");
  });

  copyButton.addEventListener("click", async () => {
    copyText(currentCopy, copyButton, "复制诊断卡");
  });
}

function buildScript(topic, audience, cta) {
  const angle = audienceAngles[audience] || audienceAngles.传统实体老板;
  const title = topic.replace(/[，。！？!?.]/g, "").slice(0, 28) || "传统老板如何用AI跑增长";
  const lines = [
    `${audience}，如果你最近也在想“${topic}”，先别急着换工具。`,
    `真正卡住你的，往往是${angle.pain}。`,
    `AI不是拿来炫技的，它应该变成你的第二增长团队：帮你出选题、写脚本、回私信、做成交提醒，还能把每次复盘沉淀下来。`,
    `你今天可以先做一个动作：${angle.method}。先跑通一个小闭环，再谈系统化放大。`,
    cta,
  ];

  const shotList = [
    "镜头1：正面半身，开头直接点痛点，语速稳一点。",
    "镜头2：切到电脑或手机页面，展示AI生成脚本/话术的动作。",
    "镜头3：回到人像，总结“先跑小闭环，再放大”。",
  ];

  return { title, lines, shotList, tone: angle.tone };
}

function initScriptForm() {
  const form = document.querySelector("#scriptForm");
  const title = document.querySelector("#scriptTitle");
  const output = document.querySelector("#scriptOutput");
  const copyButton = document.querySelector("#copyScript");
  if (!form || !title || !output || !copyButton) return;

  let currentCopy = output.innerText.trim();

  function renderScript(script) {
    title.textContent = script.title;
    output.innerHTML = "";

    const scriptTitle = document.createElement("strong");
    scriptTitle.textContent = "口播正文";
    output.appendChild(scriptTitle);

    script.lines.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      output.appendChild(p);
    });

    const shotTitle = document.createElement("strong");
    shotTitle.textContent = "拍摄提示";
    output.appendChild(shotTitle);

    const list = document.createElement("ul");
    script.shotList.forEach((shot) => {
      const item = document.createElement("li");
      item.textContent = shot;
      list.appendChild(item);
    });
    output.appendChild(list);

    const tone = document.createElement("p");
    tone.className = "script-tone";
    tone.textContent = `表达语气：${script.tone}`;
    output.appendChild(tone);

    currentCopy = [
      `【${script.title}】`,
      "",
      "口播正文：",
      ...script.lines,
      "",
      "拍摄提示：",
      ...script.shotList,
      "",
      `表达语气：${script.tone}`,
    ].join("\n");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const topic = document.querySelector("#scriptTopic").value.trim() || "传统老板如何用AI智能体获客";
    const audience = document.querySelector("#scriptAudience").value;
    const cta = document.querySelector("#scriptCta").value;
    renderScript(buildScript(topic, audience, cta));
  });

  copyButton.addEventListener("click", () => {
    copyText(currentCopy, copyButton, "复制拍摄脚本");
  });

  renderScript(
    buildScript(
      document.querySelector("#scriptTopic").value.trim() || "传统老板如何用AI智能体获客",
      document.querySelector("#scriptAudience").value,
      document.querySelector("#scriptCta").value,
    ),
  );
}

function initActiveNav() {
  const links = [...document.querySelectorAll(".desktop-nav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === id));
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 },
  );

  sections.forEach((section) => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initRoleSwitcher();
  initCaseCarousel();
  initLeadForm();
  initScriptForm();
  initActiveNav();
});
