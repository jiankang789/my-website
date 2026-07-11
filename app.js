const $ = (id) => document.getElementById(id);

const canvas = $("previewCanvas");
const ctx = canvas.getContext("2d");

const state = {
  project: null,
  assets: {
    image: null,
    video: null,
    audio: null
  },
  media: {
    image: null,
    video: null
  },
  providers: {},
  jobs: [],
  audioUrl: "",
  audioDuration: 0,
  previewFrame: 0,
  previewStart: performance.now(),
  exporting: false
};

const palettes = {
  pain: {
    bg: "#f7f2e9",
    ink: "#171b20",
    muted: "#59636f",
    accent: "#107c73",
    accent2: "#c85232",
    accent3: "#315da8",
    soft: "#e4efe9"
  },
  case: {
    bg: "#f4f0e7",
    ink: "#171b20",
    muted: "#59636f",
    accent: "#315da8",
    accent2: "#c85232",
    accent3: "#107c73",
    soft: "#e8edf7"
  },
  expert: {
    bg: "#f5f4ef",
    ink: "#16191d",
    muted: "#5f6770",
    accent: "#202b38",
    accent2: "#107c73",
    accent3: "#c85232",
    soft: "#ece9df"
  },
  list: {
    bg: "#f7f4ed",
    ink: "#171b20",
    muted: "#59636f",
    accent: "#c85232",
    accent2: "#107c73",
    accent3: "#315da8",
    soft: "#f2e7dc"
  }
};

const demoData = {
  productName: "AI短视频获客陪跑",
  targetCustomer: "想通过短视频稳定拿线索的中小企业老板",
  painPoint: "每天发视频但没有咨询，内容看起来很忙，客户却不知道为什么要找你",
  offer: "用客户痛点拆选题、用脚本模板稳定输出、用私信 SOP 把评论转成有效线索",
  proof: "已经帮线下门店搭过选题库、脚本库和跟进表",
  cta: "评论区打“获客”，领取短视频选题表"
};

function clean(text, fallback) {
  return String(text || "").trim() || fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - clamp(value, 0, 1), 3);
}

function collectInput() {
  return {
    productName: clean($("productName").value, "你的产品"),
    targetCustomer: clean($("targetCustomer").value, "目标客户"),
    painPoint: clean($("painPoint").value, "投入很多时间却没有稳定咨询"),
    offer: clean($("offer").value, "用一套清晰流程把内容转成线索"),
    proof: clean($("proof").value, "已有真实案例和可复用模板"),
    cta: clean($("cta").value, "评论区留言，领取资料"),
    scriptStyle: $("scriptStyle").value,
    tone: $("tone").value,
    duration: Number($("duration").value),
    platform: $("platform").value
  };
}

function toneLine(input) {
  const lines = {
    direct: `如果你也想让${input.platform}内容开始带来咨询，今天就先把路径搭对。`,
    warm: `先不用急着多发，先让每一条内容都承担一个获客任务。`,
    sharp: `没有转化的视频，不是努力不够，而是成交路径从一开始就断了。`
  };
  return lines[input.tone] || lines.direct;
}

function buildSceneTemplates(input) {
  const map = {
    pain: [
      {
        tag: "钩子",
        headline: "你的视频没有咨询，不一定是流量问题",
        body: `${input.targetCustomer}常见的卡点是：${input.painPoint}。`,
        voice: `${input.targetCustomer}要注意了，你的视频没有咨询，不一定是流量问题。真正的问题，往往是${input.painPoint}。`,
        weight: 0.17
      },
      {
        tag: "拆解",
        headline: "客户看懂，才会行动",
        body: "内容要先说出痛点，再给出清晰下一步。",
        voice: "客户不是看完就会买，他要先觉得你说的是他，再知道下一步该做什么。",
        weight: 0.18
      },
      {
        tag: "方案",
        headline: input.productName,
        body: input.offer,
        voice: `${input.productName}的做法是，${input.offer}。`,
        weight: 0.26
      },
      {
        tag: "信任",
        headline: "不是灵感，是流程",
        body: input.proof,
        voice: `这套方法不是靠灵感硬想，${input.proof}。`,
        weight: 0.19
      },
      {
        tag: "引流",
        headline: "先拿一张表，把路径跑通",
        body: input.cta,
        voice: `${toneLine(input)} ${input.cta}。`,
        weight: 0.2
      }
    ],
    case: [
      {
        tag: "反差",
        headline: "同样发 30 条视频，结果可能完全不同",
        body: "差别不在勤奋，而在每条视频有没有承接动作。",
        voice: "同样发三十条视频，有人只有播放量，有人开始稳定拿咨询。差别不在勤奋，而在每条视频有没有承接动作。",
        weight: 0.18
      },
      {
        tag: "问题",
        headline: "只讲产品，很难让客户开口",
        body: `${input.targetCustomer}最容易忽略的是：${input.painPoint}。`,
        voice: `很多${input.targetCustomer}一上来就讲产品，客户听完没有感觉，因为你没有先切中${input.painPoint}。`,
        weight: 0.21
      },
      {
        tag: "转折",
        headline: "把内容改成获客流程",
        body: input.offer,
        voice: `把内容改成获客流程之后，重点就变成了${input.offer}。`,
        weight: 0.25
      },
      {
        tag: "证明",
        headline: "可复制，才值得长期做",
        body: input.proof,
        voice: `${input.proof}，所以它可以复盘，可以复制，也可以交给团队执行。`,
        weight: 0.18
      },
      {
        tag: "行动",
        headline: "想要模板，直接留言",
        body: input.cta,
        voice: `如果你也想从播放量走到有效线索，${input.cta}。`,
        weight: 0.18
      }
    ],
    expert: [
      {
        tag: "判断",
        headline: "短视频获客先看三件事",
        body: "人群准不准，痛点痛不痛，动作清不清。",
        voice: "判断一个短视频账号能不能获客，先看三件事，人群准不准，痛点痛不痛，动作清不清。",
        weight: 0.18
      },
      {
        tag: "诊断",
        headline: "你现在卡在哪",
        body: input.painPoint,
        voice: `${input.targetCustomer}现在最常见的问题是，${input.painPoint}。`,
        weight: 0.2
      },
      {
        tag: "方法",
        headline: "先搭内容到线索的桥",
        body: input.offer,
        voice: `所以不要只追热点，先搭内容到线索的桥。具体做法是，${input.offer}。`,
        weight: 0.27
      },
      {
        tag: "背书",
        headline: "用数据复盘，不靠感觉",
        body: input.proof,
        voice: `${input.proof}。后面每周看选题、评论、私信和成交，内容才会越做越准。`,
        weight: 0.2
      },
      {
        tag: "收口",
        headline: "从一条能获客的视频开始",
        body: input.cta,
        voice: `${input.cta}，我把第一版表格发你。`,
        weight: 0.15
      }
    ],
    list: [
      {
        tag: "开场",
        headline: "短视频获客，先改这 3 个地方",
        body: "不要先追设备、剪辑和日更。",
        voice: "短视频获客，先改三个地方，不要先追设备、剪辑和日更。",
        weight: 0.16
      },
      {
        tag: "第一点",
        headline: "第一，开头直接点痛点",
        body: input.painPoint,
        voice: `第一，开头直接点痛点。比如，${input.painPoint}。`,
        weight: 0.2
      },
      {
        tag: "第二点",
        headline: "第二，内容给明确方法",
        body: input.offer,
        voice: `第二，内容给明确方法。你可以用${input.offer}。`,
        weight: 0.26
      },
      {
        tag: "第三点",
        headline: "第三，结尾给低门槛动作",
        body: input.cta,
        voice: `第三，结尾给低门槛动作。不要只说关注我，而是${input.cta}。`,
        weight: 0.2
      },
      {
        tag: "收束",
        headline: "先让一条视频能接线索",
        body: input.proof,
        voice: `${input.proof}。先把一条视频跑通，再批量复制。`,
        weight: 0.18
      }
    ]
  };
  return map[input.scriptStyle] || map.pain;
}

function assignTiming(scenes, duration) {
  const totalWeight = scenes.reduce((sum, scene) => sum + scene.weight, 0);
  let start = 0;
  return scenes.map((scene, index) => {
    const sceneDuration = index === scenes.length - 1 ? duration - start : duration * (scene.weight / totalWeight);
    const timed = { ...scene, start, duration: Math.max(1.8, sceneDuration) };
    start += timed.duration;
    return timed;
  });
}

function makeCoverTitle(input) {
  const titles = {
    pain: `${input.targetCustomer}发视频没咨询？`,
    case: "为什么别人发视频能拿线索？",
    expert: "短视频获客先看这三点",
    list: "获客视频先改这 3 点"
  };
  return titles[input.scriptStyle] || titles.pain;
}

function buildProject() {
  const input = collectInput();
  const scenes = assignTiming(buildSceneTemplates(input), input.duration);
  const voiceover = scenes.map((scene) => scene.voice).join(" ");
  const coverTitle = makeCoverTitle(input);
  const publishTitle = `${coverTitle}｜${input.productName}`;
  const hashtags = ["短视频获客", "获客系统", "内容营销", input.platform, input.productName]
    .map((item) => `#${item.replace(/\s+/g, "")}`)
    .join(" ");

  return {
    ...input,
    scenes,
    voiceover,
    coverTitle,
    publishTitle,
    pinnedComment: `${input.cta}。我会按行业给你发一版选题方向，先看你现在卡在哪一步。`,
    dmReply: "你好，看到你想要获客资料。你可以先发我 3 个信息：行业、客单价、现在主要获客方式。我会根据你的情况，给你一版短视频选题和私信承接建议。",
    hashtags,
    palette: palettes[input.scriptStyle] || palettes.pain
  };
}

function renderOutputs(project) {
  $("voiceoverOutput").value = project.voiceover;
  $("coverOutput").value = project.coverTitle;
  $("captionOutput").value = `${project.publishTitle}\n${project.hashtags}`;
  $("commentOutput").value = project.pinnedComment;
  $("dmOutput").value = project.dmReply;
  $("hashtagOutput").value = project.hashtags;
  $("videoMeta").textContent = `9:16 · ${project.duration} 秒 · ${project.platform}`;
  $("targetDuration").value = String(project.duration);

  const list = $("sceneList");
  list.innerHTML = "";
  project.scenes.forEach((scene, index) => {
    const card = document.createElement("article");
    card.className = "scene-card";
    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${scene.tag}｜${scene.headline}`;
    const body = document.createElement("p");
    body.textContent = `${scene.body}（${scene.duration.toFixed(1)} 秒）`;
    card.append(title, body);
    list.append(card);
  });
}

function generateProject() {
  state.project = buildProject();
  state.audioUrl = "";
  state.audioDuration = 0;
  $("audioPlayer").removeAttribute("src");
  $("downloadLink").hidden = true;
  $("exportProgress").style.width = "0%";
  renderOutputs(state.project);
  startPreview();
  setStatus("已生成");
}

function extractBenchmarkCopy() {
  const input = collectInput();
  const button = $("extractCopyBtn");
  const originalText = button.textContent;
  button.textContent = "提取中";
  button.disabled = true;
  const link = clean($("videoLinkInput").value, "未填写链接");
  const copy = [
    `对标来源：${link}`,
    "",
    `开头钩子：${input.targetCustomer}最容易误判的，不是内容发得少，而是没有把${input.painPoint}讲清楚。`,
    "",
    `主体结构：先点出客户正在遇到的问题，再说明${input.productName}如何用${input.offer}解决。`,
    "",
    `信任背书：${input.proof}。`,
    "",
    `结尾动作：${input.cta}。`
  ].join("\n");
  $("benchmarkOutput").value = copy;
  $("voiceoverOutput").value = copy
    .replace(/^对标来源：.*\n\n/, "")
    .replace(/开头钩子：|主体结构：|信任背书：|结尾动作：/g, "");
  setStatus("已提取对标");
  button.textContent = "已提取";
  window.setTimeout(() => {
    button.disabled = false;
    button.textContent = originalText;
  }, 900);
}

function generateTitleAndCover() {
  if (!state.project) generateProject();
  const input = collectInput();
  const title = makeCoverTitle(input);
  const publishTitle = `${title}｜${input.productName}`;
  $("coverOutput").value = title;
  $("captionOutput").value = `${publishTitle}\n#短视频获客 #AI数字人 #内容营销 #${input.platform}`;
  $("commentOutput").value = `${input.cta}。我会按行业给你发一版选题方向。`;
  $("dmOutput").value = "你好，看到你想要获客资料。发我行业、客单价、当前获客方式，我给你一版短视频选题建议。";
  $("hashtagOutput").value = `#短视频获客 #AI员工 #数字人视频 #${input.productName.replace(/\s+/g, "")}`;
  setStatus("标题已生成");
}

function openCoverDraft() {
  switchToTab("script");
  $("coverOutput").focus();
  $("coverOutput").select();
  setStatus("封面文案已选中");
}

function configureSubtitles() {
  switchToTab("scenes");
  $("stageNote").textContent = $("subtitleSwitch").checked
    ? "字幕已开启：会使用分镜文案作为剪辑字幕。"
    : "字幕已关闭：可以直接使用模板画面。";
  setStatus("字幕设置已更新");
}

function toggleTemplateMode() {
  const button = $("templateToggleBtn");
  const disabled = button.dataset.disabled === "true";
  button.dataset.disabled = disabled ? "false" : "true";
  button.textContent = disabled ? "不用模板" : "使用模板";
  $("stageNote").textContent = disabled ? "已恢复模板剪辑。" : "已切换为不用模板，优先使用字幕和素材。";
  setStatus(disabled ? "模板已恢复" : "模板已关闭");
}

function chooseBackgroundMusic() {
  const value = $("bgmSelect").value;
  $("stageNote").textContent = value === "选择背景音乐" ? "未选择背景音乐。" : `已选择背景音乐：${value}`;
  setStatus("音乐已设置");
}

function updateVoiceModeHint() {
  if ($("voiceProvider").value === "elevenlabs-clone") {
    $("audioHint").textContent = state.providers?.elevenlabs?.configured
      ? "已选择 ElevenLabs：上传声音样本并勾选授权后可克隆。"
      : "ElevenLabs 未配置 API Key，暂时不能克隆真人声音。";
  } else {
    $("audioHint").textContent = "当前为本机演示配音，不会克隆真人声音。";
  }
}

function editSubtitles() {
  switchToTab("scenes");
  setStatus("正在编辑字幕");
}

function authorizePublishAccount() {
  switchToTab("jobs");
  $("publishStatus").textContent = "账号授权入口已打开：请先在任务页配置平台/接口。";
  setStatus("等待授权");
}

function publishVideo() {
  const serverUrl = $("serverDownloadLink").hidden ? "" : $("serverDownloadLink").href;
  const browserUrl = $("downloadLink").hidden ? "" : $("downloadLink").href;
  const videoUrl = clean($("publishVideoUrl").value, serverUrl || browserUrl);
  if (!videoUrl || videoUrl === "未填写链接") {
    alert("请先生成或选择一个视频地址。");
    return;
  }
  $("publishVideoUrl").value = videoUrl;
  $("publishStatus").textContent = "发布任务已创建（演示模式）：真实发布需要接入平台账号授权。";
  setStatus("发布任务已创建");
}

async function loadHealth() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) throw new Error("服务未响应");
    const data = await response.json();
    state.providers = data.providers || {};
    renderProviders();
    setStatus("本机模式");
  } catch {
    setStatus("离线");
  }
}

async function loadProviders() {
  try {
    const response = await fetch("/api/providers");
    const data = await response.json();
    state.providers = data.providers || {};
    renderProviders();
    updateVoiceModeHint();
  } catch {
    $("providerSummary").textContent = "接口未连接";
  }
}

async function loadProviderConfig() {
  try {
    const response = await fetch("/api/provider-config");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "配置读取失败");
    state.providers = data.providers || {};
    const config = data.config || {};
    $("publicBaseUrlInput").value = config.publicBaseUrl || "";
    $("configSummary").textContent = [
      config.elevenlabsApiKey ? `ElevenLabs: ${config.elevenlabsApiKey}` : "ElevenLabs: 未配置",
      config.didApiKey ? `D-ID: ${config.didApiKey}` : "D-ID: 未配置",
      config.publicBaseUrl ? `公网: ${config.publicBaseUrl}` : "公网: 未配置"
    ].join(" ｜ ");
    renderProviders();
    updateVoiceModeHint();
  } catch {
    $("configSummary").textContent = "配置读取失败";
  }
}

async function saveProviderConfig() {
  setBusy($("saveProviderConfigBtn"), true, "保存中");
  try {
    const response = await fetch("/api/provider-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        elevenlabsApiKey: $("elevenlabsKeyInput").value.trim(),
        didApiKey: $("didKeyInput").value.trim(),
        publicBaseUrl: $("publicBaseUrlInput").value.trim(),
        heygenApiKey: $("heygenKeyInput").value.trim()
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存失败");
    state.providers = data.providers || {};
    $("elevenlabsKeyInput").value = "";
    $("didKeyInput").value = "";
    $("heygenKeyInput").value = "";
    const config = data.config || {};
    $("configSummary").textContent = [
      config.elevenlabsApiKey ? `ElevenLabs: ${config.elevenlabsApiKey}` : "ElevenLabs: 未配置",
      config.didApiKey ? `D-ID: ${config.didApiKey}` : "D-ID: 未配置",
      config.publicBaseUrl ? `公网: ${config.publicBaseUrl}` : "公网: 未配置"
    ].join(" ｜ ");
    renderProviders();
    updateVoiceModeHint();
    setStatus("配置已保存");
  } catch (error) {
    alert(error.message);
  } finally {
    setBusy($("saveProviderConfigBtn"), false, "保存接口配置");
  }
}

async function loadJobs() {
  try {
    const response = await fetch("/api/jobs");
    const data = await response.json();
    state.jobs = data.jobs || [];
    renderJobs();
  } catch {
    state.jobs = [];
  }
}

async function loadVoices() {
  const select = $("voiceSelect");
  select.innerHTML = "";
  try {
    const response = await fetch("/api/voices");
    if (!response.ok) throw new Error("无法读取声音");
    const data = await response.json();
    const voices = data.voices || [];
    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} · ${voice.culture}`;
      select.append(option);
    });
    const zh = voices.find((voice) => voice.culture.toLowerCase().startsWith("zh"));
    if (zh) select.value = zh.name;
  } catch {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "系统默认声音";
    select.append(option);
  }
}

function renderProviders() {
  const providers = state.providers || {};
  const elevenReady = providers.elevenlabs?.configured;
  const didReady = providers.did?.configured && providers.did?.publicBaseUrl;
  $("providerSummary").textContent = elevenReady || didReady ? "云接口可用" : "本地演示";

  const list = $("providerList");
  if (!list) return;
  list.innerHTML = "";
  [
    ["ElevenLabs", providers.elevenlabs, "授权声音克隆 / TTS"],
    ["D-ID", providers.did, "图片数字人口播"],
    ["HeyGen", providers.heygen, "商业数字人预留"],
    ["Local", providers.local, "本机配音 / 浏览器导出"]
  ].forEach(([name, info, desc]) => {
    const item = document.createElement("div");
    const ready = Boolean(info?.configured) && (name !== "D-ID" || info.publicBaseUrl);
    item.className = `provider-pill ${ready ? "ready" : "pending"}`;
    const title = document.createElement("strong");
    title.textContent = name;
    const body = document.createElement("span");
    const missing = info?.missing?.length ? `缺少：${info.missing.join("、")}` : "已配置";
    body.textContent = `${desc}｜${missing}`;
    item.append(title, body);
    list.append(item);
  });
}

function renderJobs() {
  const list = $("jobList");
  if (!list) return;
  list.innerHTML = "";
  if (!state.jobs.length) {
    const empty = document.createElement("article");
    empty.className = "job-card";
    empty.innerHTML = "<strong>暂无任务</strong><p>上传素材并确认授权后，可以创建真人数字人任务。</p>";
    list.append(empty);
    return;
  }

  state.jobs.forEach((job) => {
    const card = document.createElement("article");
    card.className = `job-card ${job.status}`;
    const title = document.createElement("strong");
    title.textContent = `${job.projectName}｜${job.status}`;
    const body = document.createElement("p");
    body.textContent = `${job.sourceType === "video" ? "短视频源" : "图片源"} · ${job.voiceProvider} · ${job.avatarProvider} · ${job.targetDuration || "-"} 秒`;
    const messages = document.createElement("p");
    messages.textContent = (job.messages || []).slice(-2).join(" / ") || job.error || "";
    card.append(title, body, messages);
    if (job.audioUrl) {
      const audioLink = document.createElement("a");
      audioLink.href = job.audioUrl;
      audioLink.target = "_blank";
      audioLink.textContent = "试听任务配音";
      card.append(audioLink);
    }
    if (job.resultUrl && job.resultUrl !== job.audioUrl) {
      const resultLink = document.createElement("a");
      resultLink.href = job.resultUrl;
      resultLink.target = "_blank";
      resultLink.textContent = " 查看结果素材";
      card.append(resultLink);
    }
    list.append(card);
  });
}

function setStatus(text) {
  $("serverStatus").textContent = text;
}

function setBusy(button, busy, text) {
  button.disabled = busy;
  button.textContent = text;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function uploadFile(input, kind, statusId) {
  const file = input.files?.[0];
  if (!file) return;
  const status = $(statusId);
  status.className = "asset-status";
  status.textContent = "上传中";

  try {
    const dataUrl = await fileToDataUrl(file);
    const response = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        name: file.name,
        dataUrl
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "上传失败");
    state.assets[kind === "audio" ? "audio" : kind] = data.asset;
    status.className = "asset-status ready";
    status.textContent = `已上传：${data.asset.originalName}`;

    if (kind === "image") await loadImageAsset(data.asset);
    if (kind === "video") await loadVideoAsset(data.asset);
    startPreview();
  } catch (error) {
    status.className = "asset-status error";
    status.textContent = error.message;
  }
}

function loadImageAsset(asset) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      state.media.image = image;
      $("sourceType").value = "image";
      $("stageNote").textContent = "已套入真人图片，适合生成图片数字人口播。";
      resolve();
    };
    image.onerror = reject;
    image.src = asset.url;
  });
}

function loadVideoAsset(asset) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = asset.url;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.onloadeddata = () => {
      state.media.video = video;
      $("sourceType").value = "video";
      $("stageNote").textContent = "已套入真人短视频，当前版本会做本地配音和包装预览。";
      video.play().catch(() => {});
      resolve();
    };
    video.onerror = () => resolve();
  });
}

function collectConsent() {
  return {
    hasRights: $("consentRights").checked,
    voiceRights: $("consentVoice").checked,
    notPublicFigure: $("consentNoPublic").checked,
    commercialUse: $("consentCommercial").checked,
    aiDisclosure: $("consentDisclosure").checked
  };
}

async function createDigitalHuman() {
  if (!state.project) generateProject();
  state.project.voiceover = $("voiceoverOutput").value.trim() || state.project.voiceover;

  const sourceType = $("sourceType").value;
  const body = {
    project: state.project,
    text: state.project.voiceover,
    sourceType,
    imageAssetId: state.assets.image?.id || "",
    videoAssetId: state.assets.video?.id || "",
    voiceSampleAssetId: state.assets.audio?.id || "",
    avatarProvider: $("avatarProvider").value,
    voiceProvider: $("voiceProvider").value,
    targetDuration: Number($("targetDuration").value || state.project.duration),
    localVoice: $("voiceSelect").value,
    voiceRate: Number($("voiceRate").value),
    consent: collectConsent()
  };

  setBusy($("digitalHumanBtn"), true, "任务生成中");
  setStatus("创建任务");
  try {
    const response = await fetch("/api/digital-human", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.job?.error || data.error || "数字人任务失败");
    state.jobs = [data.job, ...state.jobs.filter((job) => job.id !== data.job.id)];
    if (data.job.audioUrl) {
      state.audioUrl = data.job.audioUrl;
      state.audioDuration = Number(data.job.audioDuration || 0);
      $("audioPlayer").src = data.job.audioUrl;
    }
    renderJobs();
    switchToTab("jobs");
    setStatus("任务已创建");
  } catch (error) {
    alert(error.message);
    setStatus("任务失败");
  } finally {
    setBusy($("digitalHumanBtn"), false, "生成真人数字人任务");
  }
}

async function generateAudio() {
  if (!state.project) generateProject();
  setBusy($("ttsBtn"), true, "生成中");
  setStatus("生成配音");
  try {
    const text = $("voiceoverOutput").value.trim() || state.project.voiceover;
    const voiceProvider = $("voiceProvider").value;
    let response;

    if (voiceProvider === "elevenlabs-clone") {
      if (!state.providers?.elevenlabs?.configured) {
        $("audioHint").textContent = "未配置 ElevenLabs API Key，无法克隆真人声音。请在“任务”页保存 Key。";
        throw new Error("未配置 ELEVENLABS_API_KEY，不能进行 ElevenLabs 声音克隆。");
      }
      if (!state.assets.audio?.id) {
        $("audioHint").textContent = "请先上传授权声音样本。";
        throw new Error("请先上传授权声音样本。");
      }

      const consent = collectConsent();
      if (!Object.values(consent).every(Boolean)) {
        $("audioHint").textContent = "请先勾选人像/声音授权确认。";
        throw new Error("请先在“视频生成”区域勾选全部授权确认。");
      }

      $("audioHint").textContent = "正在创建 ElevenLabs 授权声音...";
      const cloneResponse = await fetch("/api/voice-clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${state.project.productName || "voice"}-${Date.now()}`,
          sampleAssetId: state.assets.audio.id,
          consent
        })
      });
      const cloneData = await cloneResponse.json();
      if (!cloneResponse.ok) throw new Error(cloneData.error || cloneData.message || "声音克隆失败");
      if (cloneData.provider !== "elevenlabs") {
        throw new Error(cloneData.message || "声音克隆未完成");
      }

      $("audioHint").textContent = "正在使用克隆声音生成配音...";
      response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "elevenlabs",
          text,
          voiceId: cloneData.voiceId
        })
      });
    } else {
      $("audioHint").textContent = "正在生成本机演示配音...";
      response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: $("voiceSelect").value,
          rate: Number($("voiceRate").value),
          volume: 100
        })
      });
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "配音失败");
    state.audioUrl = data.url;
    state.audioDuration = Number(data.duration || 0);
    $("audioPlayer").src = data.url;
    $("audioHint").textContent = data.provider === "elevenlabs" ? "ElevenLabs 克隆配音已生成。" : "本机演示配音已生成。";
    setStatus(data.provider === "elevenlabs" ? "克隆配音完成" : "配音完成");
    return data.url;
  } catch (error) {
    setStatus("配音失败");
    alert(error.message);
    throw error;
  } finally {
    setBusy($("ttsBtn"), false, "生成配音");
  }
}

function playAudio() {
  if (!state.audioUrl) {
    generateAudio().then(() => $("audioPlayer").play());
    return;
  }
  $("audioPlayer").play();
}

function fitScenes(project, duration) {
  const base = project.scenes;
  const totalWeight = base.reduce((sum, scene) => sum + scene.weight, 0);
  let start = 0;
  return base.map((scene, index) => {
    const sceneDuration = index === base.length - 1 ? duration - start : duration * (scene.weight / totalWeight);
    const next = { ...scene, start, duration: Math.max(1.8, sceneDuration) };
    start += next.duration;
    return next;
  });
}

function currentScene(scenes, time) {
  return scenes.find((scene) => time >= scene.start && time < scene.start + scene.duration) || scenes[scenes.length - 1];
}

function activeVisual() {
  if ($("sourceType").value === "video" && state.media.video) return state.media.video;
  if (state.media.image) return state.media.image;
  if (state.media.video) return state.media.video;
  return null;
}

function drawFrame(project, time, totalDuration) {
  const w = canvas.width;
  const h = canvas.height;
  const palette = project.palette;
  const scenes = fitScenes(project, totalDuration);
  const scene = currentScene(scenes, clamp(time, 0, totalDuration));
  const local = (time - scene.start) / scene.duration;
  const eased = easeOutCubic(local);
  const visual = activeVisual();

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = palette.soft;
  ctx.fillRect(0, 0, w, 250);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(0, 0, 36, h);
  ctx.fillStyle = palette.accent2;
  ctx.fillRect(w - 68, 150, 30, 520);

  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = palette.ink;
  for (let y = 320; y < h - 360; y += 110) {
    ctx.fillRect(104, y, w - 208, 2);
  }
  ctx.restore();

  const contentX = 112;
  const maxWidth = w - 224;
  const enterY = 40 * (1 - eased);

  ctx.fillStyle = palette.accent;
  roundRect(ctx, contentX, 90, 230, 54, 27);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 30px Microsoft YaHei, Arial";
  ctx.textBaseline = "middle";
  ctx.fillText(scene.tag, contentX + 30, 117);

  if (visual) {
    drawVisualCard(visual, contentX, 175, maxWidth, 690, palette);
    ctx.fillStyle = palette.ink;
    ctx.font = "900 58px Microsoft YaHei, Arial";
    ctx.textBaseline = "top";
    drawWrappedText(scene.headline, contentX, 910 + enterY, maxWidth, 70, 3);
    ctx.fillStyle = palette.muted;
    ctx.font = "700 32px Microsoft YaHei, Arial";
    drawWrappedText(scene.body, contentX, 1128 + enterY * 0.45, maxWidth, 48, 4);
    drawCaptionBlock(project, scene, palette, contentX, h - 500, maxWidth);
  } else {
    ctx.fillStyle = palette.ink;
    ctx.font = "900 78px Microsoft YaHei, Arial";
    ctx.textBaseline = "top";
    drawWrappedText(scene.headline, contentX, 245 + enterY, maxWidth, 92, 4);
    ctx.fillStyle = palette.muted;
    ctx.font = "700 38px Microsoft YaHei, Arial";
    drawWrappedText(scene.body, contentX, 650 + enterY * 0.45, maxWidth, 58, 5);
    drawCaptionBlock(project, scene, palette, contentX, h - 500, maxWidth);
  }

  drawBottomBar(project, palette, time, totalDuration);
}

function drawVisualCard(visual, x, y, width, height, palette) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x - 18, y - 18, width + 36, height + 36, 8);
  ctx.fill();
  ctx.clip();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, width, height, 8);
  ctx.clip();
  drawObjectCover(visual, x, y, width, height);
  ctx.restore();

  ctx.strokeStyle = "rgba(22, 25, 29, 0.14)";
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, width, height, 8);
  ctx.stroke();

  ctx.fillStyle = palette.accent2;
  roundRect(ctx, x + 24, y + 24, 210, 48, 24);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 24px Microsoft YaHei, Arial";
  ctx.textBaseline = "middle";
  ctx.fillText($("sourceType").value === "video" ? "真人短视频" : "真人图片", x + 48, y + 48);
}

function drawObjectCover(media, x, y, width, height) {
  const sourceWidth = media.videoWidth || media.naturalWidth || width;
  const sourceHeight = media.videoHeight || media.naturalHeight || height;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / targetRatio;
    sy = (sourceHeight - sh) / 2;
  }

  try {
    ctx.drawImage(media, sx, sy, sw, sh, x, y, width, height);
  } catch {
    ctx.fillStyle = "#20242b";
    ctx.fillRect(x, y, width, height);
  }
}

function drawCaptionBlock(project, scene, palette, x, y, maxWidth) {
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x - 20, y - 24, maxWidth + 40, 260, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(22, 25, 29, 0.12)";
  ctx.lineWidth = 2;
  roundRect(ctx, x - 20, y - 24, maxWidth + 40, 260, 8);
  ctx.stroke();

  ctx.fillStyle = palette.accent2;
  ctx.font = "800 30px Microsoft YaHei, Arial";
  ctx.fillText(project.productName, x, y);

  ctx.fillStyle = palette.ink;
  ctx.font = "800 40px Microsoft YaHei, Arial";
  drawWrappedText(scene.voice, x, y + 54, maxWidth, 54, 3);
}

function drawBottomBar(project, palette, time, totalDuration) {
  const w = canvas.width;
  const h = canvas.height;
  const x = 88;
  const y = h - 164;
  const maxWidth = w - 176;

  ctx.fillStyle = palette.ink;
  roundRect(ctx, x, y, maxWidth, 86, 8);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 33px Microsoft YaHei, Arial";
  ctx.textBaseline = "middle";
  drawSingleLine(project.cta, x + 30, y + 43, maxWidth - 60);

  ctx.fillStyle = "rgba(22, 25, 29, 0.16)";
  roundRect(ctx, x, h - 56, maxWidth, 12, 6);
  ctx.fill();
  ctx.fillStyle = palette.accent2;
  roundRect(ctx, x, h - 56, maxWidth * clamp(time / totalDuration, 0, 1), 12, 6);
  ctx.fill();
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = Array.from(String(text));
  let line = "";
  let lineCount = 0;
  for (const char of chars) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = char.trimStart();
      lineCount += 1;
      if (lineCount >= maxLines) return;
    } else {
      line = next;
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line, x, y + lineCount * lineHeight);
  }
}

function drawSingleLine(text, x, y, maxWidth) {
  const raw = String(text);
  let output = raw;
  while (ctx.measureText(output).width > maxWidth && output.length > 4) {
    output = `${output.slice(0, -3)}...`;
  }
  ctx.fillText(output, x, y);
}

function startPreview() {
  cancelAnimationFrame(state.previewFrame);
  state.previewStart = performance.now();
  const loop = (now) => {
    if (!state.project || state.exporting) return;
    const elapsed = ((now - state.previewStart) / 1000) % state.project.duration;
    drawFrame(state.project, elapsed, state.project.duration);
    state.previewFrame = requestAnimationFrame(loop);
  };
  state.previewFrame = requestAnimationFrame(loop);
}

function supportedMimeType() {
  const types = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm"
  ];
  return types.find((type) => window.MediaRecorder && MediaRecorder.isTypeSupported(type)) || "";
}

async function exportVideo() {
  if (!state.project) generateProject();
  if (!state.audioUrl) await generateAudio();
  if (!window.MediaRecorder) {
    alert("当前浏览器不支持视频录制，请换用新版 Chrome 或 Edge。");
    return;
  }

  setBusy($("exportBtn"), true, "导出中");
  setStatus("导出视频");
  state.exporting = true;
  cancelAnimationFrame(state.previewFrame);
  $("downloadLink").hidden = true;
  $("exportProgress").style.width = "0%";

  try {
    const audioContext = new AudioContext();
    const audioBuffer = await fetch(state.audioUrl)
      .then((response) => response.arrayBuffer())
      .then((buffer) => audioContext.decodeAudioData(buffer));

    const targetDuration = Number($("targetDuration").value || state.project.duration);
    const renderDuration = Math.max(targetDuration, audioBuffer.duration + 0.25);
    const source = audioContext.createBufferSource();
    const destination = audioContext.createMediaStreamDestination();
    source.buffer = audioBuffer;
    source.connect(destination);

    const canvasStream = canvas.captureStream(30);
    const stream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...destination.stream.getAudioTracks()
    ]);
    const mimeType = supportedMimeType();
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: 6500000,
      audioBitsPerSecond: 128000
    });
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size) chunks.push(event.data);
    };

    const stopped = new Promise((resolve) => {
      recorder.onstop = resolve;
    });

    recorder.start(200);
    await audioContext.resume();
    source.start();

    const started = performance.now();
    await new Promise((resolve) => {
      const render = (now) => {
        const time = clamp((now - started) / 1000, 0, renderDuration);
        drawFrame(state.project, time, renderDuration);
        $("exportProgress").style.width = `${Math.round((time / renderDuration) * 100)}%`;
        if (time < renderDuration) requestAnimationFrame(render);
        else resolve();
      };
      requestAnimationFrame(render);
    });

    recorder.stop();
    await stopped;
    source.stop();
    stream.getTracks().forEach((track) => track.stop());
    await audioContext.close();

    const finalType = recorder.mimeType || mimeType || "video/webm";
    const blob = new Blob(chunks, { type: finalType });
    const extension = finalType.includes("mp4") ? "mp4" : "webm";
    const url = URL.createObjectURL(blob);
    const link = $("downloadLink");
    link.href = url;
    link.download = `${state.project.productName.replace(/[\\/:*?"<>|]/g, "") || "short-video"}.${extension}`;
    link.textContent = `下载生成的视频（.${extension}）`;
    link.hidden = false;
    $("publishVideoUrl").value = url;
    $("publishStatus").textContent = "浏览器剪辑视频已生成，可进入发布。";
    $("exportProgress").style.width = "100%";
    setStatus(extension === "mp4" ? "MP4 完成" : "WebM 完成");
  } catch (error) {
    console.error(error);
    alert(error.message || "导出失败");
    setStatus("导出失败");
  } finally {
    state.exporting = false;
    setBusy($("exportBtn"), false, "导出视频");
    startPreview();
  }
}

async function renderVideoOnServer() {
  if (!state.project) generateProject();
  state.project.voiceover = $("voiceoverOutput").value.trim() || state.project.voiceover;
  if (!state.audioUrl) await generateAudio();

  const sourceType = $("sourceType").value;
  if (sourceType === "image" && !state.assets.image) {
    alert("请先上传真人图片。");
    return;
  }
  if (sourceType === "video" && !state.assets.video) {
    alert("请先上传真人短视频。");
    return;
  }

  setBusy($("serverRenderBtn"), true, "合成中");
  setStatus("服务端合成");
  $("serverDownloadLink").hidden = true;

  try {
    const response = await fetch("/api/render-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: state.project,
        text: state.project.voiceover,
        sourceType,
        imageAssetId: state.assets.image?.id || "",
        videoAssetId: state.assets.video?.id || "",
        audioUrl: state.audioUrl,
        targetDuration: Number($("targetDuration").value || state.project.duration),
        localVoice: $("voiceSelect").value,
        voiceRate: Number($("voiceRate").value)
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "服务端合成失败");

    const link = $("serverDownloadLink");
    link.href = data.url;
    link.download = data.fileName || `${state.project.productName || "server-render"}.mp4`;
    link.textContent = `下载服务端合成视频（${Math.round(data.duration || 0)} 秒）`;
    link.hidden = false;
    $("publishVideoUrl").value = new URL(data.url, window.location.href).href;
    $("publishStatus").textContent = "服务端合成视频已生成，可进入发布。";
    setStatus("服务端 MP4 完成");
  } catch (error) {
    alert(error.message);
    setStatus("合成失败");
  } finally {
    setBusy($("serverRenderBtn"), false, "服务端合成");
  }
}

function switchToTab(name) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
  document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.toggle("active", pane.id === `tab-${name}`));
}

function switchTab(event) {
  const button = event.target.closest(".tab");
  if (!button) return;
  switchToTab(button.dataset.tab);
}

function fillDemo() {
  Object.entries(demoData).forEach(([id, value]) => {
    $(id).value = value;
  });
  $("scriptStyle").value = "pain";
  $("tone").value = "direct";
  $("duration").value = "30";
  $("platform").value = "抖音";
  $("targetDuration").value = "30";
  generateProject();
}

$("generateBtn").addEventListener("click", generateProject);
$("extractCopyBtn").addEventListener("click", extractBenchmarkCopy);
$("ttsBtn").addEventListener("click", generateAudio);
$("playAudioBtn").addEventListener("click", playAudio);
$("exportBtn").addEventListener("click", exportVideo);
$("serverRenderBtn").addEventListener("click", renderVideoOnServer);
$("fillDemoBtn").addEventListener("click", fillDemo);
$("digitalHumanBtn").addEventListener("click", createDigitalHuman);
$("saveProviderConfigBtn").addEventListener("click", saveProviderConfig);
$("subtitleSettingsBtn").addEventListener("click", configureSubtitles);
$("templateToggleBtn").addEventListener("click", toggleTemplateMode);
$("chooseBgmBtn").addEventListener("click", chooseBackgroundMusic);
$("editSubtitleBtn").addEventListener("click", editSubtitles);
$("titleGenerateBtn").addEventListener("click", generateTitleAndCover);
$("coverRegenerateBtn").addEventListener("click", generateTitleAndCover);
$("openCoverBtn").addEventListener("click", openCoverDraft);
$("authBtn").addEventListener("click", authorizePublishAccount);
$("publishBtn").addEventListener("click", publishVideo);
$("voiceProvider").addEventListener("change", updateVoiceModeHint);
$("imageInput").addEventListener("change", (event) => uploadFile(event.target, "image", "imageAssetStatus"));
$("videoInput").addEventListener("change", (event) => uploadFile(event.target, "video", "videoAssetStatus"));
$("voiceSampleInput").addEventListener("change", (event) => uploadFile(event.target, "audio", "voiceAssetStatus"));
$("subtitleSwitch").addEventListener("change", configureSubtitles);
$("backgroundSwitch").addEventListener("change", () => {
  $("stageNote").textContent = $("backgroundSwitch").checked ? "已开启背景设置，可填写背景图片地址。" : "已关闭背景设置。";
  setStatus($("backgroundSwitch").checked ? "背景已开启" : "背景已关闭");
});
$("voiceVolume").addEventListener("input", () => setStatus(`人声音量 ${$("voiceVolume").value}`));
$("bgmVolume").addEventListener("input", () => setStatus(`BGM音量 ${$("bgmVolume").value}`));
document.querySelector(".tabs").addEventListener("click", switchTab);

loadHealth();
loadProviders();
loadProviderConfig();
loadVoices();
loadJobs();
generateProject();
