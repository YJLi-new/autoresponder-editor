const STORAGE_KEYS = {
  localTemplates: "ali_editor_local_templates",
  unlockMarker: "ali_editor_unlock_marker",
};

const fields = {
  name: document.getElementById("nameInput"),
  locale: document.getElementById("localeInput"),
  startAt: document.getElementById("startInput"),
  endAt: document.getElementById("endInput"),
  scope: document.getElementById("scopeInput"),
  subject: document.getElementById("subjectInput"),
  opening: document.getElementById("openingInput"),
  body: document.getElementById("bodyInput"),
  fallbackContact: document.getElementById("contactInput"),
  signature: document.getElementById("signatureInput"),
};

const authEls = {
  gate: document.getElementById("authGate"),
  form: document.getElementById("authForm"),
  status: document.getElementById("authStatus"),
  accessKey: document.getElementById("accessKeyInput"),
};

const appEls = {
  app: document.getElementById("editorApp"),
  list: document.getElementById("templateList"),
  form: document.getElementById("templateForm"),
  addBtn: document.getElementById("addTemplateBtn"),
  deleteBtn: document.getElementById("deleteTemplateBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  resetBtn: document.getElementById("resetBtn"),
  importInput: document.getElementById("importInput"),
  logoutBtn: document.getElementById("logoutBtn"),
  previewSubject: document.getElementById("previewSubject"),
  previewBody: document.getElementById("previewBody"),
  status: document.getElementById("appStatus"),
  copyTextBtn: document.getElementById("copyTextBtn"),
  copyHtmlBtn: document.getElementById("copyHtmlBtn"),
  chips: Array.from(document.querySelectorAll(".chip")),
};

const state = {
  accessConfig: null,
  templates: [],
  selectedId: null,
  focusedField: null,
};

boot();

async function boot() {
  bindEvents();

  await Promise.all([loadInitialTemplates(), loadAccessConfig()]);

  renderList();
  selectTemplate(state.selectedId || state.templates[0]?.id || null);

  const unlockMarker = sessionStorage.getItem(STORAGE_KEYS.unlockMarker);
  if (unlockMarker && state.accessConfig && unlockMarker === state.accessConfig.hash) {
    showApp();
    setStatus(authEls.status, "当前会话已解锁。", false);
  }
}

function bindEvents() {
  authEls.form.addEventListener("submit", onAuthSubmit);

  appEls.addBtn.addEventListener("click", () => {
    const template = createTemplate();
    state.templates.unshift(template);
    state.selectedId = template.id;
    persistLocalTemplates();
    renderList();
    selectTemplate(template.id);
  });

  appEls.deleteBtn.addEventListener("click", () => {
    if (!state.selectedId) return;
    if (state.templates.length === 1) {
      setStatus(appEls.status, "至少保留一个模板。", true);
      return;
    }

    state.templates = state.templates.filter((item) => item.id !== state.selectedId);
    state.selectedId = state.templates[0]?.id || null;
    persistLocalTemplates();
    renderList();
    selectTemplate(state.selectedId);
  });

  appEls.form.addEventListener("input", () => {
    const active = getSelectedTemplate();
    if (!active) return;

    writeFormToTemplate(active);
    active.updatedAt = new Date().toISOString();

    persistLocalTemplates();
    renderList();
    renderPreview();
  });

  Object.entries(fields).forEach(([key, element]) => {
    if (!element) return;

    if (["subject", "opening", "body", "fallbackContact", "signature"].includes(key)) {
      element.addEventListener("focus", () => {
        state.focusedField = element;
      });
    }
  });

  appEls.exportBtn.addEventListener("click", exportTemplatesAsFile);
  appEls.importBtn.addEventListener("click", () => appEls.importInput.click());
  appEls.importInput.addEventListener("change", onImportFile);
  appEls.resetBtn.addEventListener("click", resetTemplatesFromStarter);
  appEls.logoutBtn.addEventListener("click", logout);
  appEls.copyTextBtn.addEventListener("click", copyPreviewText);
  appEls.copyHtmlBtn.addEventListener("click", copyPreviewHtml);

  appEls.chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (!state.focusedField) {
        setStatus(appEls.status, "请先点击一个输入框，再插入变量。", true);
        return;
      }
      insertAtCursor(state.focusedField, chip.dataset.token || "");
      state.focusedField.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
}

async function loadAccessConfig() {
  try {
    const response = await fetch("data/access-control.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`配置文件加载失败（${response.status}）`);
    }

    const payload = await response.json();
    state.accessConfig = normalizeAccessConfig(payload);
  } catch (error) {
    setStatus(
      authEls.status,
      `无法加载访问控制配置：${error.message}。请检查 data/access-control.json`,
      true,
    );
    authEls.form.querySelector("button[type='submit']")?.setAttribute("disabled", "disabled");
  }
}

function normalizeAccessConfig(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("配置格式错误");
  }

  const iterations = Number(payload.iterations);
  const salt = String(payload.salt || "");
  const hash = String(payload.hash || "").toLowerCase();

  if (!Number.isInteger(iterations) || iterations < 100000) {
    throw new Error("iterations 至少 100000");
  }

  if (!salt) {
    throw new Error("salt 缺失");
  }

  if (!/^[a-f0-9]{64}$/.test(hash)) {
    throw new Error("hash 必须是 64 位十六进制 SHA-256 值");
  }

  return {
    version: Number(payload.version || 1),
    kdf: String(payload.kdf || "PBKDF2-HMAC-SHA-256"),
    iterations,
    salt,
    hash,
    updatedAt: String(payload.updatedAt || ""),
  };
}

async function onAuthSubmit(event) {
  event.preventDefault();

  if (!state.accessConfig) {
    setStatus(authEls.status, "访问控制配置未加载，无法验证。", true);
    return;
  }

  const accessKey = authEls.accessKey.value;
  if (!accessKey) {
    setStatus(authEls.status, "请输入访问密钥。", true);
    return;
  }

  setStatus(authEls.status, "正在验证密钥...");

  try {
    const pass = await verifyAccessKey(accessKey, state.accessConfig);
    if (!pass) {
      setStatus(authEls.status, "密钥错误，请重试。", true);
      authEls.accessKey.value = "";
      return;
    }

    sessionStorage.setItem(STORAGE_KEYS.unlockMarker, state.accessConfig.hash);
    authEls.accessKey.value = "";
    showApp();
    setStatus(authEls.status, "验证成功，已进入编辑器。", false);
  } catch (error) {
    setStatus(authEls.status, `验证失败：${error.message}`, true);
  }
}

async function verifyAccessKey(plainKey, config) {
  if (!window.crypto?.subtle) {
    throw new Error("浏览器不支持 Web Crypto API");
  }

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(plainKey),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const saltBytes = base64ToBytes(config.salt);

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBytes,
      iterations: config.iterations,
    },
    keyMaterial,
    256,
  );

  const derivedHex = bytesToHex(new Uint8Array(derivedBits));
  return constantTimeEqual(derivedHex, config.hash);
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }

  return mismatch === 0;
}

function showApp() {
  authEls.gate.classList.add("hidden");
  appEls.app.classList.remove("hidden");
  appEls.app.setAttribute("aria-hidden", "false");
}

function hideApp() {
  authEls.gate.classList.remove("hidden");
  appEls.app.classList.add("hidden");
  appEls.app.setAttribute("aria-hidden", "true");
  setStatus(appEls.status, "");
}

async function loadInitialTemplates() {
  const cached = loadLocalTemplates();
  if (cached.length > 0) {
    state.templates = cached;
    state.selectedId = cached[0].id;
    return;
  }

  const starter = await readStarterTemplates();
  state.templates = starter.length > 0 ? starter : [createTemplate()];
  state.selectedId = state.templates[0]?.id || null;
  persistLocalTemplates();
}

async function readStarterTemplates() {
  try {
    const response = await fetch("data/auto-reply-templates.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("starter data missing");
    }

    const payload = await response.json();
    return parseTemplatesPayload(payload);
  } catch (_error) {
    return [];
  }
}

async function resetTemplatesFromStarter() {
  const starter = await readStarterTemplates();
  if (starter.length === 0) {
    setStatus(appEls.status, "恢复失败：默认模板文件不可用。", true);
    return;
  }

  state.templates = starter;
  state.selectedId = starter[0].id;
  persistLocalTemplates();
  renderList();
  selectTemplate(state.selectedId);
  setStatus(appEls.status, "已恢复默认模板。", false);
}

function parseTemplatesPayload(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.templates)
      ? payload.templates
      : [];

  return list.map((item) => normalizeTemplate(item)).filter(Boolean);
}

function normalizeTemplate(item) {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id || uid(),
    name: String(item.name || "未命名模板"),
    locale: String(item.locale || "zh-CN"),
    startAt: String(item.startAt || ""),
    endAt: String(item.endAt || ""),
    scope: String(item.scope || "all"),
    subject: String(item.subject || "自动回复通知"),
    opening: String(item.opening || "您好，"),
    body: String(item.body || "感谢来信，我目前暂时不在办公室。"),
    fallbackContact: String(item.fallbackContact || ""),
    signature: String(item.signature || "此致\n{{company_name}} 团队"),
    updatedAt: String(item.updatedAt || new Date().toISOString()),
  };
}

function createTemplate() {
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

  return {
    id: uid(),
    name: `新模板 ${now.toLocaleDateString("zh-CN")}`,
    locale: "zh-CN",
    startAt: toDateTimeLocal(now),
    endAt: toDateTimeLocal(inSevenDays),
    scope: "all",
    subject: "自动回复：我已收到您的邮件",
    opening: "您好，{{sender_name}}：",
    body: "感谢您的来信。我目前不在办公室，将在 {{return_date}} 后尽快回复。",
    fallbackContact: "support@example.com",
    signature: "祝好\n{{company_name}}",
    updatedAt: new Date().toISOString(),
  };
}

function toDateTimeLocal(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderList() {
  appEls.list.innerHTML = "";

  state.templates.forEach((template) => {
    const li = document.createElement("li");
    li.className = `template-item${template.id === state.selectedId ? " active" : ""}`;
    li.dataset.id = template.id;
    li.innerHTML = `<strong>${escapeHtml(template.name)}</strong><span>${escapeHtml(template.subject)}</span>`;

    li.addEventListener("click", () => {
      selectTemplate(template.id);
    });

    appEls.list.appendChild(li);
  });
}

function selectTemplate(id) {
  if (!id) return;

  state.selectedId = id;
  const active = getSelectedTemplate();
  if (!active) return;

  fields.name.value = active.name;
  fields.locale.value = active.locale;
  fields.startAt.value = active.startAt;
  fields.endAt.value = active.endAt;
  fields.scope.value = active.scope;
  fields.subject.value = active.subject;
  fields.opening.value = active.opening;
  fields.body.value = active.body;
  fields.fallbackContact.value = active.fallbackContact;
  fields.signature.value = active.signature;

  renderList();
  renderPreview();
}

function getSelectedTemplate() {
  return state.templates.find((item) => item.id === state.selectedId) || null;
}

function writeFormToTemplate(template) {
  template.name = fields.name.value;
  template.locale = fields.locale.value;
  template.startAt = fields.startAt.value;
  template.endAt = fields.endAt.value;
  template.scope = fields.scope.value;
  template.subject = fields.subject.value;
  template.opening = fields.opening.value;
  template.body = fields.body.value;
  template.fallbackContact = fields.fallbackContact.value;
  template.signature = fields.signature.value;
}

function buildMailText(template) {
  const lines = [];

  lines.push(template.opening || "");
  lines.push("");
  lines.push(template.body || "");

  if (template.startAt || template.endAt) {
    lines.push("");
    lines.push(`生效时段：${template.startAt || "未设置"} ~ ${template.endAt || "未设置"}`);
  }

  if (template.fallbackContact) {
    lines.push(`紧急联系：${template.fallbackContact}`);
  }

  if (template.signature) {
    lines.push("");
    lines.push(template.signature);
  }

  return lines.join("\n").trim();
}

function renderPreview() {
  const active = getSelectedTemplate();
  if (!active) return;

  appEls.previewSubject.textContent = active.subject || "(无主题)";
  appEls.previewBody.textContent = buildMailText(active);
}

function persistLocalTemplates() {
  localStorage.setItem(
    STORAGE_KEYS.localTemplates,
    JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      templates: state.templates,
    }),
  );
}

function loadLocalTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.localTemplates);
    if (!raw) return [];

    const payload = JSON.parse(raw);
    return parseTemplatesPayload(payload);
  } catch (_error) {
    return [];
  }
}

function exportTemplatesAsFile() {
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    templates: state.templates,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `auto-reply-templates-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function onImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const parsed = parseTemplatesPayload(payload);
    if (parsed.length === 0) {
      throw new Error("JSON 中没有可用模板");
    }

    state.templates = parsed;
    state.selectedId = parsed[0].id;
    persistLocalTemplates();
    renderList();
    selectTemplate(state.selectedId);
    setStatus(appEls.status, `已导入 ${parsed.length} 条模板。`, false);
  } catch (error) {
    setStatus(appEls.status, `导入失败：${error.message}`, true);
  } finally {
    appEls.importInput.value = "";
  }
}

function logout() {
  sessionStorage.removeItem(STORAGE_KEYS.unlockMarker);
  hideApp();
  setStatus(authEls.status, "已锁定，请重新输入密钥。", false);
}

async function copyPreviewText() {
  const active = getSelectedTemplate();
  if (!active) return;

  const text = `主题：${active.subject}\n\n${buildMailText(active)}`;
  await copyToClipboard(text, "已复制纯文本。", "复制失败，请检查浏览器权限。");
}

async function copyPreviewHtml() {
  const active = getSelectedTemplate();
  if (!active) return;

  const body = buildMailText(active)
    .split("\n")
    .map((line) => escapeHtml(line))
    .join("<br>");

  const html = `<p><strong>主题：</strong>${escapeHtml(active.subject)}</p><p>${body}</p>`;
  await copyToClipboard(html, "已复制 HTML。", "复制失败，请检查浏览器权限。");
}

async function copyToClipboard(content, okMessage, errorMessage) {
  try {
    await navigator.clipboard.writeText(content);
    setStatus(appEls.status, okMessage, false);
  } catch (_error) {
    setStatus(appEls.status, errorMessage, true);
  }
}

function setStatus(element, text, isError = false) {
  element.textContent = text;
  element.classList.toggle("error", isError);
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

function base64ToBytes(base64Text) {
  const binary = atob(base64Text);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function escapeHtml(raw) {
  return String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function insertAtCursor(input, text) {
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const value = input.value;

  input.value = value.slice(0, start) + text + value.slice(end);
  const cursor = start + text.length;
  input.selectionStart = cursor;
  input.selectionEnd = cursor;
  input.focus();
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `id_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}
