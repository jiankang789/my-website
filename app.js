const els = {
  name: document.querySelector("#name"),
  product: document.querySelector("#product"),
  imageFile: document.querySelector("#imageFile"),
  imageAudio: document.querySelector("#imageAudio"),
  imageCopy: document.querySelector("#imageCopy"),
  imagePreview: document.querySelector("#imagePreview"),
  audioPreview: document.querySelector("#imageAudioPreview"),
  canvas: document.querySelector("#imageVideoCanvas"),
  video: document.querySelector("#generatedImageVideo"),
  download: document.querySelector("#downloadImageVideo"),
  output: document.querySelector("#imageOutput"),
  toast: document.querySelector("#toast"),
};

let latestResult = "";

function showToast(message) {
  els.toast.textContent = message;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.textContent = "";
  }, 2200);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[char]);
}

function data() {
  return {
    name: els.name.value.trim() || "美业轻抗衰门店",
    product: els.product.value.trim() || "轻抗衰项目",
    copy: els.imageCopy.value.trim() || "做轻抗衰之前，先判断自己适不适合。别急着下单，先做一次AI项目适配诊断。",
  };
}

function renderResult(content) {
  latestResult = content;
  els.output.innerHTML = `<pre>${escapeHtml(content)}</pre>`;
}

function buildScript() {
  const info = data();
  const imageName = els.imageFile.files[0]?.name || "未上传图片";
  const audioName = els.imageAudio.files[0]?.name || "未上传声音";
  return [
    "短视频生成结果",
    "",
    `门店：${info.name}`,
    `项目：${info.product}`,
    `图片素材：${imageName}`,
    `声音素材：${audioName}`,
    "",
    "视频结构：",
    `1. 开场标题：做${info.product}前，先看你适不适合`,
    `2. 中段字幕：${info.copy}`,
    "3. 结尾引导：评论“诊断”，领取AI项目适配建议",
    "",
    "发布文案：",
    `不是所有人都适合直接做${info.product}，先做一次适配诊断，再决定方案。`,
  ].join("\n");
}

function updatePreview(input, preview) {
  const file = input.files[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片读取失败"));
    image.src = URL.createObjectURL(file);
  });
}

function waitForMedia(media) {
  return new Promise((resolve, reject) => {
    if (media.readyState >= 1) {
      resolve();
      return;
    }
    media.onloadedmetadata = () => resolve();
    media.onerror = () => reject(new Error("声音读取失败"));
  });
}

function wrapLines(ctx, value, maxWidth, maxLines) {
  const chars = String(value).split("");
  const lines = [];
  let line = "";
  chars.forEach((char) => {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function drawImageCover(ctx, image) {
  const {width, height} = ctx.canvas;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawFrame(ctx, image, info, progress) {
  const {width, height} = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  drawImageCover(ctx, image);

  const shade = ctx.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, "rgba(0,0,0,.16)");
  shade.addColorStop(.58, "rgba(0,0,0,.05)");
  shade.addColorStop(1, "rgba(0,0,0,.78)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(8,11,16,.82)";
  ctx.fillRect(48, 64, width - 96, 130);
  ctx.fillStyle = "#ffd37b";
  ctx.font = "800 40px Microsoft YaHei, Arial";
  ctx.fillText(info.name, 78, 118);
  ctx.fillStyle = "#fff";
  ctx.font = "800 34px Microsoft YaHei, Arial";
  ctx.fillText(info.product, 78, 166);

  ctx.fillStyle = "rgba(8,11,16,.86)";
  ctx.fillRect(48, height - 390, width - 96, 280);

  ctx.fillStyle = "#fff";
  ctx.font = "900 42px Microsoft YaHei, Arial";
  wrapLines(ctx, `做${info.product}前，先看你适不适合`, width - 140, 2).forEach((line, index) => {
    ctx.fillText(line, 78, height - 315 + index * 54);
  });

  ctx.fillStyle = "#dbe7ff";
  ctx.font = "700 30px Microsoft YaHei, Arial";
  wrapLines(ctx, info.copy, width - 140, 4).forEach((line, index) => {
    ctx.fillText(line, 78, height - 188 + index * 42);
  });

  ctx.fillStyle = "#ffd37b";
  ctx.fillRect(48, height - 68, (width - 96) * progress, 9);
}

async function generateVideo() {
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    renderResult("当前浏览器不支持网页内视频合成。请用最新版 Chrome / Edge 打开。");
    return;
  }

  const imageFile = els.imageFile.files[0];
  if (!imageFile) {
    renderResult("请先上传一张图片。");
    return;
  }

  const info = data();
  renderResult(`${buildScript()}\n\n状态：正在合成视频，请不要关闭页面...`);
  showToast("正在合成视频");

  const ctx = els.canvas.getContext("2d");
  const image = await loadImage(imageFile);
  const canvasStream = els.canvas.captureStream(30);
  let stream = canvasStream;
  let audio = null;
  let audioCtx = null;
  let duration = 8;

  const audioFile = els.imageAudio.files[0];
  if (audioFile) {
    audio = new Audio(URL.createObjectURL(audioFile));
    await waitForMedia(audio);
    duration = Math.min(Math.max(audio.duration || 8, 3), 60);
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio);
    const destination = audioCtx.createMediaStreamDestination();
    source.connect(destination);
    source.connect(audioCtx.destination);
    stream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...destination.stream.getAudioTracks(),
    ]);
    await audioCtx.resume();
  }

  const candidates = [
    {mime: "video/mp4;codecs=avc1.42E01E,mp4a.40.2", ext: "mp4"},
    {mime: "video/mp4", ext: "mp4"},
    {mime: "video/webm;codecs=vp9,opus", ext: "webm"},
    {mime: "video/webm", ext: "webm"},
  ];
  const picked = candidates.find((item) => MediaRecorder.isTypeSupported(item.mime)) || candidates[candidates.length - 1];
  const mimeType = picked.mime;
  const recorder = new MediaRecorder(stream, {mimeType});
  const chunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const stopped = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  const start = performance.now();
  let animationId = 0;
  function loop(now) {
    const elapsed = (now - start) / 1000;
    drawFrame(ctx, image, info, Math.min(elapsed / duration, 1));
    if (elapsed < duration) animationId = requestAnimationFrame(loop);
  }

  recorder.start();
  animationId = requestAnimationFrame(loop);
  if (audio) {
    audio.currentTime = 0;
    await audio.play();
  }

  await new Promise((resolve) => setTimeout(resolve, duration * 1000));
  cancelAnimationFrame(animationId);
  if (audio) audio.pause();
  recorder.stop();
  await stopped;
  if (audioCtx) await audioCtx.close();

  const blob = new Blob(chunks, {type: mimeType});
  const url = URL.createObjectURL(blob);
  els.video.src = url;
  els.video.style.display = "block";
  els.download.href = url;
  els.download.download = `AI获客短视频.${picked.ext}`;
  els.download.style.display = "inline-flex";
  renderResult(`${buildScript()}\n\n状态：视频已生成，可预览，也可以点击“下载生成的视频”。`);
  showToast("视频已生成");
}

els.imageFile.addEventListener("change", () => updatePreview(els.imageFile, els.imagePreview));
els.imageAudio.addEventListener("change", () => updatePreview(els.imageAudio, els.audioPreview));

document.querySelector("#fillDemo").addEventListener("click", () => {
  els.name.value = "悦容轻抗衰管理中心";
  els.product.value = "喷射抗衰提升项目";
  els.imageCopy.value = "做轻抗衰之前，先判断自己适不适合。别急着下单，先做一次AI项目适配诊断。";
  renderResult(buildScript());
  showToast("示例已填入");
});

document.querySelector("#runImageVideo").addEventListener("click", () => {
  generateVideo().catch((error) => {
    renderResult(`视频生成失败：${error.message}\n\n建议：先用 Chrome / Edge 打开网页，并允许音频播放；也可以先只上传图片测试静音视频。`);
  });
});

document.querySelector("#copyResult").addEventListener("click", async () => {
  const text = latestResult || buildScript();
  try {
    await navigator.clipboard.writeText(text);
    showToast("已复制");
  } catch {
    renderResult(text);
    showToast("请长按结果手动复制");
  }
});

renderResult(buildScript());
