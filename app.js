const STORAGE_KEYS = {
  repoConfig: "ali_editor_repo_config",
  localTemplates: "ali_editor_local_templates",
  sessionToken: "ali_editor_session_token",
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
  token: document.getElementById("tokenInput"),
  owner: document.getElementById("ownerInput"),
  repo: document.getElementById("repoInput"),
  branch: document.getElementById("branchInput"),
  path: document.getElementById("pathInput"),
};

const appEls = {
  app: document.getElementById("editorApp"),
  repoBadge: document.getElementById("repoBadge"),
  list: document.getElementById("templateList"),
  form: document.getElementById("templateForm"),
  addBtn: document.getElementById("addTemplateBtn"),
  deleteBtn: document.getElementById("deleteTemplateBtn"),
  syncBtn: document.getElementById("syncBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importInput: document.getElementById("importInput"),
  logoutBtn: document.getElementById("logoutBtn"),
  previewSubject: document.getElementById("previewSubject"),
  previewBody: document.getElementById("previewBody"),
  syncStatus: document.getElementById("syncStatus"),
  copyTextBtn: document.getElementById("copyTextBtn"),
  copyHtmlBtn: document.getElementById("copyHtmlBtn"),
  chips: Array.from(document.querySelectorAll(".chip")),
};

const state = {
  auth: null,
  templates: [],
  selectedId: null,
  remoteSha: null,
  focusedField: null,
};

boot();

async function boot() {
  bindEvents();
  restoreRepoConfig();
  restoreSessionToken();
  await loadInitialTemplates();
  renderList();
  selectTemplate(state.selectedId || state.templates[0]?.id || null);
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
      setStatus(appEls.syncStatus, "至少保留一个模板。", true);
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

  appEls.syncBtn.addEventListener("click", syncToGitHub);
  appEls.exportBtn.addEventListener("click", exportTemplatesAsFile);
  appEls.importBtn.addEventListener("click", () => appEls.importInput.click());
  appEls.importInput.addEventListener("change", onImportFile);
  appEls.logoutBtn.addEventListener("click", logout);
  appEls.copyTextBtn.addEventListener("click", copyPreviewText);
  appEls.copyHtmlBtn.addEventListener("click", copyPreviewHtml);

  appEls.chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (!state.focusedField) {
        setStatus(appEls.syncStatus, "请先点击一个输入框，再插入变量。", true);
        return;
      }
      insertAtCursor(state.focusedField, chip.dataset.token || "");
      state.focusedField.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
}

function restoreRepoConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.repoConfig);
    if (!raw) return;
    const config = JSON.parse(raw);
    authEls.owner.value = config.owner || "";
    authEls.repo.value = config.repo || "";
    authEls.branch.value = config.branch || "main";
    authEls.path.value = config.path || "data/auto-reply-templates.json";
  } catch (_error) {
    // Ignore invalid cache.
  }
}

function restoreSessionToken() {
  const token = sessionStorage.getItem(STORAGE_KEYS.sessionToken);
  if (token) {
    authEls.token.value = token;
  }
}

async function loadInitialTemplates() {
  const cached = loadLocalTemplates();
  if (cached.length > 0) {
    state.templates = cached;
    state.selectedId = cached[0].id;
    return;
  }

  try {
    const response = await fetch("data/auto-reply-templates.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("starter data missing");
    }
    const data = await response.json();
    const templates = parseTemplatesPayload(data);
    state.templates = templates.length > 0 ? templates : [createTemplate()];
  } catch (_error) {
    state.templates = [createTemplate()];
  }

  state.selectedId = state.templates[0]?.id || null;
  persistLocalTemplates();
}

async function onAuthSubmit(event) {
  event.preventDefault();

  const token = authEls.token.value.trim();
  const owner = authEls.owner.value.trim();
  const repo = authEls.repo.value.trim();
  const branch = authEls.branch.value.trim() || "main";
  const path = authEls.path.value.trim() || "data/auto-reply-templates.json";

  if (!token || !owner || !repo) {
    setStatus(authEls.status, "请完整填写 Token、Owner、Repo。", true);
    return;
  }

  setStatus(authEls.status, "正在校验权限...");

  try {
    const user = await apiGet("/user", token);
    await apiGet(`/repos/${owner}/${repo}`, token);

    state.auth = {
      token,
      owner,
      repo,
      branch,
      path,
      user: user.login,
    };

    sessionStorage.setItem(STORAGE_KEYS.sessionToken, token);
    localStorage.setItem(STORAGE_KEYS.repoConfig, JSON.stringify({ owner, repo, branch, path }));

    showApp();
    await loadTemplatesFromGitHub();
    setStatus(authEls.status, `已授权：${user.login}`);
  } catch (error) {
    setStatus(authEls.status, `授权失败：${error.message}`, true);
  }
}

function showApp() {
  authEls.gate.classList.add("hidden");
  appEls.app.classList.remove("hidden");
  appEls.app.setAttribute("aria-hidden", "false");
  appEls.repoBadge.textContent = `${state.auth.owner}/${state.auth.repo}@${state.auth.branch} · ${state.auth.path}`;
}

function hideApp() {
  authEls.gate.classList.remove("hidden");
  appEls.app.classList.add("hidden");
  appEls.app.setAttribute("aria-hidden", "true");
  setStatus(appEls.syncStatus, "");
}

async function loadTemplatesFromGitHub() {
  if (!state.auth) return;

  setStatus(appEls.syncStatus, "正在拉取 GitHub 模板...");

  try {
    const remote = await getRemoteFile();
    const payload = JSON.parse(base64ToUtf8(remote.content));
    const parsed = parseTemplatesPayload(payload);

    if (parsed.length > 0) {
      state.templates = parsed;
      state.selectedId = parsed[0].id;
      persistLocalTemplates();
      renderList();
      selectTemplate(state.selectedId);
      state.remoteSha = remote.sha;
      setStatus(appEls.syncStatus, `已加载远端模板（${parsed.length} 条）`);
      return;
    }

    setStatus(appEls.syncStatus, "远端文件存在但无有效模板，已保留本地模板。", true);
  } catch (error) {
    if (error.code === 404) {
      state.remoteSha = null;
      setStatus(appEls.syncStatus, "远端模板文件不存在，首次同步会自动创建。", false);
      return;
    }
    setStatus(appEls.syncStatus, `拉取失败：${error.message}。已保留本地模板。`, true);
  }
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

function setStatus(element, text, isError = false) {
  element.textContent = text;
  element.classList.toggle("error", isError);
}

function persistLocalTemplates() {
  localStorage.setItem(
    STORAGE_KEYS.localTemplates,
    JSON.stringify({
      updatedAt: new Date().toISOString(),
      templates: state.templates,
    }),
  );
}

function loadLocalTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.localTemplates);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return parseTemplatesPayload(data);
  } catch (_error) {
    return [];
  }
}

async function syncToGitHub() {
  if (!state.auth) {
    setStatus(appEls.syncStatus, "请先完成授权。", true);
    return;
  }

  setStatus(appEls.syncStatus, "正在同步到 GitHub...");

  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    templates: state.templates,
  };

  const content = utf8ToBase64(JSON.stringify(payload, null, 2));

  try {
    let sha = state.remoteSha;
    try {
      const remote = await getRemoteFile();
      sha = remote.sha;
    } catch (error) {
      if (error.code !== 404) throw error;
      sha = null;
    }

    const body = {
      message: `chore: update auto reply templates (${new Date().toISOString()})`,
      content,
      branch: state.auth.branch,
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await apiPut(
      `/repos/${state.auth.owner}/${state.auth.repo}/contents/${encodeURIComponentPath(state.auth.path)}`,
      state.auth.token,
      body,
    );

    state.remoteSha = response.content?.sha || sha;
    setStatus(appEls.syncStatus, "同步成功：模板已写入 GitHub。", false);
  } catch (error) {
    setStatus(appEls.syncStatus, `同步失败：${error.message}`, true);
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
  const a = document.createElement("a");
  a.href = url;
  a.download = `auto-reply-templates-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
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
    setStatus(appEls.syncStatus, `已导入 ${parsed.length} 条模板`);
  } catch (error) {
    setStatus(appEls.syncStatus, `导入失败：${error.message}`, true);
  } finally {
    appEls.importInput.value = "";
  }
}

function logout() {
  state.auth = null;
  state.remoteSha = null;
  sessionStorage.removeItem(STORAGE_KEYS.sessionToken);
  authEls.token.value = "";
  hideApp();
  setStatus(authEls.status, "已退出授权。", false);
}

async function copyPreviewText() {
  const active = getSelectedTemplate();
  if (!active) return;
  const text = `主题：${active.subject}\n\n${buildMailText(active)}`;
  await copyToClipboard(text, "已复制纯文本");
}

async function copyPreviewHtml() {
  const active = getSelectedTemplate();
  if (!active) return;
  const body = buildMailText(active)
    .split("\n")
    .map((line) => escapeHtml(line))
    .join("<br>");

  const html = `<p><strong>主题：</strong>${escapeHtml(active.subject)}</p><p>${body}</p>`;
  await copyToClipboard(html, "已复制 HTML");
}

async function copyToClipboard(content, okMessage) {
  try {
    await navigator.clipboard.writeText(content);
    setStatus(appEls.syncStatus, okMessage, false);
  } catch (_error) {
    setStatus(appEls.syncStatus, "复制失败，请检查浏览器权限。", true);
  }
}

async function getRemoteFile() {
  const query = `?ref=${encodeURIComponent(state.auth.branch)}`;
  return apiGet(
    `/repos/${state.auth.owner}/${state.auth.repo}/contents/${encodeURIComponentPath(state.auth.path)}${query}`,
    state.auth.token,
  );
}

async function apiGet(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  return response.json();
}

async function apiPut(path, token, body) {
  const response = await fetch(`https://api.github.com${path}`, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  return response.json();
}

async function toApiError(response) {
  let message = `HTTP ${response.status}`;

  try {
    const data = await response.json();
    if (data?.message) {
      message = data.message;
    }
  } catch (_error) {
    // Keep fallback message.
  }

  const error = new Error(message);
  error.code = response.status;
  return error;
}

function encodeURIComponentPath(path) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function base64ToUtf8(base64) {
  const cleaned = base64.replace(/\n/g, "");
  const bytes = Uint8Array.from(atob(cleaned), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function escapeHtml(raw) {
  return raw
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
