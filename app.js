const STORAGE_KEYS = {
  localTemplateGroups: "ali_editor_local_template_groups",
  activationPrefs: "ali_editor_activation_prefs",
  unlockMarker: "ali_editor_unlock_marker",
};

const LOCALE_ORDER = ["zh-CN", "en-US"];
const LOCALE_LABELS = {
  "zh-CN": "中文",
  "en-US": "English",
};
const ALIMAIL_WEBMAIL_URL = "https://qiye.aliyun.com/alimail/entries/v5.1/mail/inbox/all";

const fields = {
  category: document.getElementById("categoryInput"),
  name: document.getElementById("nameInput"),
  startAt: document.getElementById("startInput"),
  endAt: document.getElementById("endInput"),
  scope: document.getElementById("scopeInput"),
  subject: document.getElementById("subjectInput"),
  opening: document.getElementById("openingInput"),
  body: document.getElementById("bodyInput"),
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
  activateAliMailBtn: document.getElementById("activateAliMailBtn"),
  manualGuideBox: document.getElementById("manualGuideBox"),
  manualGuideList: document.getElementById("manualGuideList"),
  copyManualSubjectBtn: document.getElementById("copyManualSubjectBtn"),
  copyManualBodyBtn: document.getElementById("copyManualBodyBtn"),
  copyManualPacketBtn: document.getElementById("copyManualPacketBtn"),
  targetMailboxInput: document.getElementById("targetMailboxInput"),
  activateModeSelect: document.getElementById("activateModeSelect"),
  chips: Array.from(document.querySelectorAll(".chip")),
  localeButtons: Array.from(document.querySelectorAll("#editorLocaleSwitch .locale-btn")),
  meta: {
    templateId: document.getElementById("metaTemplateId"),
    rule: document.getElementById("metaRule"),
    routing: document.getElementById("metaRouting"),
    sla: document.getElementById("metaSla"),
    matchFields: document.getElementById("metaMatchFields"),
    keywords: document.getElementById("metaKeywords"),
    exclusions: document.getElementById("metaExclusions"),
    placeholders: document.getElementById("metaPlaceholders"),
    note: document.getElementById("metaNote"),
  },
};

const state = {
  accessConfig: null,
  groups: [],
  selectedGroupId: null,
  selectedLocale: "zh-CN",
  focusedField: null,
  activationGuide: null,
  activationPrefs: {
    targetMailbox: "",
    mode: "current",
  },
};

boot();

async function boot() {
  bindEvents();
  setStatus(authEls.status, "正在加载访问配置...");

  await Promise.all([loadInitialGroups(), loadAccessConfig()]);
  restoreActivationPrefs();
  renderActivationPrefs();

  renderList();
  selectGroup(state.selectedGroupId || state.groups[0]?.groupId || null, state.selectedLocale);

  const unlockMarker = sessionStorage.getItem(STORAGE_KEYS.unlockMarker);
  if (unlockMarker && state.accessConfig && unlockMarker === state.accessConfig.hash) {
    showApp();
    setStatus(authEls.status, "当前会话已解锁。", false);
  }
}

function bindEvents() {
  authEls.form.addEventListener("submit", onAuthSubmit);

  appEls.addBtn.addEventListener("click", () => {
    const created = createGroup();
    state.groups.unshift(created);
    state.selectedGroupId = created.groupId;
    state.selectedLocale = "zh-CN";
    persistLocalGroups();
    renderList();
    selectGroup(created.groupId, "zh-CN");
  });

  appEls.deleteBtn.addEventListener("click", () => {
    if (!state.selectedGroupId) return;

    if (state.groups.length <= 1) {
      setStatus(appEls.status, "至少保留一个模板类别。", true);
      return;
    }

    state.groups = state.groups.filter((group) => group.groupId !== state.selectedGroupId);
    state.selectedGroupId = state.groups[0]?.groupId || null;
    persistLocalGroups();
    renderList();
    selectGroup(state.selectedGroupId, state.selectedLocale);
  });

  appEls.form.addEventListener("input", () => {
    const group = getSelectedGroup();
    const version = getSelectedVersion(group, state.selectedLocale);
    if (!group || !version) return;

    writeFormToState(group, version);
    persistLocalGroups();
    renderList();
    renderPreview();
    renderMeta();
  });

  Object.entries(fields).forEach(([key, element]) => {
    if (!element) return;

    if (["subject", "opening", "body", "signature"].includes(key)) {
      element.addEventListener("focus", () => {
        state.focusedField = element;
      });
    }
  });

  appEls.localeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const locale = button.dataset.locale;
      if (!locale) return;
      if (!state.selectedGroupId) return;
      selectGroup(state.selectedGroupId, locale);
    });
  });

  appEls.exportBtn.addEventListener("click", exportTemplatesAsFile);
  appEls.importBtn.addEventListener("click", () => appEls.importInput.click());
  appEls.importInput.addEventListener("change", onImportFile);
  appEls.resetBtn.addEventListener("click", resetTemplatesFromStarter);
  appEls.logoutBtn.addEventListener("click", logout);
  appEls.copyTextBtn.addEventListener("click", copyPreviewText);
  appEls.copyHtmlBtn.addEventListener("click", copyPreviewHtml);
  appEls.activateAliMailBtn.addEventListener("click", activateInAliMail);
  appEls.copyManualSubjectBtn?.addEventListener("click", copyManualSubject);
  appEls.copyManualBodyBtn?.addEventListener("click", copyManualBody);
  appEls.copyManualPacketBtn?.addEventListener("click", copyManualPacket);
  appEls.targetMailboxInput.addEventListener("input", onActivationPrefChange);
  appEls.activateModeSelect.addEventListener("change", onActivationPrefChange);

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
    setStatus(authEls.status, "请输入访问密钥。", false);
  } catch (error) {
    setStatus(
      authEls.status,
      `无法加载访问控制配置：${error.message}。请检查 data/access-control.json`,
      true,
    );
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
    setStatus(authEls.status, "访问配置尚未就绪，正在重试加载...", true);
    await loadAccessConfig();
    if (!state.accessConfig) {
      setStatus(authEls.status, "访问配置加载失败，请刷新页面后重试。", true);
      return;
    }
  }

  if (!window.crypto?.subtle) {
    setStatus(authEls.status, "当前浏览器环境不支持密钥验证，请使用 HTTPS 访问。", true);
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

async function loadInitialGroups() {
  const cached = loadLocalGroups();
  if (cached.length > 0) {
    state.groups = cached;
    state.selectedGroupId = cached[0].groupId;
    return;
  }

  const starter = await readStarterGroups();
  state.groups = starter.length > 0 ? starter : [createGroup()];
  state.selectedGroupId = state.groups[0]?.groupId || null;
  persistLocalGroups();
}

async function readStarterGroups() {
  try {
    const response = await fetch("data/auto-reply-templates.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("starter data missing");
    }

    const payload = await response.json();
    return parseTemplateGroupsPayload(payload);
  } catch (_error) {
    return [];
  }
}

async function resetTemplatesFromStarter() {
  const starter = await readStarterGroups();
  if (starter.length === 0) {
    setStatus(appEls.status, "恢复失败：默认模板文件不可用。", true);
    return;
  }

  state.groups = starter;
  state.selectedGroupId = starter[0].groupId;
  state.selectedLocale = "zh-CN";
  persistLocalGroups();
  renderList();
  selectGroup(state.selectedGroupId, state.selectedLocale);
  setStatus(appEls.status, "已恢复默认模板。", false);
}

function parseTemplateGroupsPayload(payload) {
  if (Array.isArray(payload)) {
    return normalizeLegacyTemplates(payload);
  }

  if (Array.isArray(payload?.groups)) {
    return payload.groups.map((group) => normalizeGroup(group)).filter(Boolean);
  }

  if (Array.isArray(payload?.templates)) {
    return normalizeLegacyTemplates(payload.templates);
  }

  return [];
}

function normalizeLegacyTemplates(list) {
  const groupsMap = new Map();

  list.forEach((item) => {
    if (!item || typeof item !== "object") return;

    const groupId = String(item.groupId || item.templateId || item.id || uid());
    const locale = String(item.locale || "zh-CN");

    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, {
        groupId,
        category: String(item.category || item.name || "未命名类别"),
        direction: String(item.direction || "inbox"),
        ruleId: String(item.ruleId || ""),
        priority: Number.isFinite(Number(item.priority)) ? Number(item.priority) : null,
        matchFields: String(item.matchFields || ""),
        keywords: String(item.keywords || ""),
        exclusions: String(item.exclusions || ""),
        routing: String(item.routing || ""),
        sla: String(item.sla || ""),
        placeholders: normalizePlaceholders(item.placeholders),
        note: String(item.note || ""),
        versions: {},
        updatedAt: String(item.updatedAt || new Date().toISOString()),
      });
    }

    const group = groupsMap.get(groupId);
    group.versions[locale] = normalizeVersion(item, locale);
  });

  return Array.from(groupsMap.values()).map((group) => normalizeGroup(group));
}

function normalizeGroup(input) {
  if (!input || typeof input !== "object") return null;

  const groupId = String(input.groupId || input.templateId || input.id || uid());
  const category = String(input.category || input.name || "未命名类别");

  const normalized = {
    groupId,
    category,
    direction: String(input.direction || "inbox"),
    ruleId: String(input.ruleId || ""),
    priority: Number.isFinite(Number(input.priority)) ? Number(input.priority) : null,
    matchFields: String(input.matchFields || ""),
    keywords: String(input.keywords || ""),
    exclusions: String(input.exclusions || ""),
    routing: String(input.routing || ""),
    sla: String(input.sla || ""),
    placeholders: normalizePlaceholders(input.placeholders),
    note: String(input.note || ""),
    versions: {},
    updatedAt: String(input.updatedAt || new Date().toISOString()),
  };

  const versions = input.versions && typeof input.versions === "object" ? input.versions : null;

  if (versions) {
    LOCALE_ORDER.forEach((locale) => {
      if (versions[locale]) {
        normalized.versions[locale] = normalizeVersion(versions[locale], locale);
      }
    });
  }

  if (input.locale && input.subject && !normalized.versions[input.locale]) {
    normalized.versions[input.locale] = normalizeVersion(input, input.locale);
  }

  const firstVersion = normalized.versions[LOCALE_ORDER[0]] || normalized.versions[LOCALE_ORDER[1]] || null;

  LOCALE_ORDER.forEach((locale) => {
    if (!normalized.versions[locale]) {
      normalized.versions[locale] = firstVersion
        ? cloneVersionForLocale(firstVersion, locale)
        : createDefaultVersion(locale, category);
    }
  });

  return normalized;
}

function normalizeVersion(input, locale) {
  const safeLocale = LOCALE_ORDER.includes(locale) ? locale : "zh-CN";
  return {
    locale: safeLocale,
    name: String(input.name || (safeLocale === "zh-CN" ? "中文模板" : "English Template")),
    startAt: String(input.startAt || ""),
    endAt: String(input.endAt || ""),
    scope: String(input.scope || "external"),
    subject: String(input.subject || ""),
    opening: String(input.opening || ""),
    body: String(input.body || ""),
    signature: String(input.signature || ""),
    updatedAt: String(input.updatedAt || new Date().toISOString()),
  };
}

function cloneVersionForLocale(base, locale) {
  const cloned = { ...base };
  cloned.locale = locale;
  if (locale === "zh-CN" && !/中文/.test(cloned.name)) {
    cloned.name = `${cloned.name}（中文）`;
  }
  if (locale === "en-US" && !/English/.test(cloned.name)) {
    cloned.name = `${cloned.name} (English)`;
  }
  return cloned;
}

function normalizePlaceholders(input) {
  if (Array.isArray(input)) {
    return input.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function createGroup() {
  const now = new Date().toISOString();
  const label = `新类别 ${new Date().toLocaleDateString("zh-CN")}`;

  return {
    groupId: `T_CUSTOM_${Date.now()}`,
    category: label,
    direction: "inbox",
    ruleId: "",
    priority: null,
    matchFields: "",
    keywords: "",
    exclusions: "",
    routing: "",
    sla: "",
    placeholders: [],
    note: "",
    versions: {
      "zh-CN": createDefaultVersion("zh-CN", label),
      "en-US": createDefaultVersion("en-US", label),
    },
    updatedAt: now,
  };
}

function createDefaultVersion(locale, category) {
  return {
    locale,
    name: locale === "zh-CN" ? `${category}（中文）` : `${category} (English)`,
    startAt: "",
    endAt: "",
    scope: "external",
    subject: locale === "zh-CN" ? "自动回复：您的邮件已收到" : "Auto Reply: We Have Received Your Email",
    opening: locale === "zh-CN" ? "您好 {{Name}}，" : "Hello {{Name}},",
    body:
      locale === "zh-CN"
        ? "感谢您的来信，我们已经收到并会尽快回复。"
        : "Thank you for your email. We have received your message and will respond soon.",
    signature:
      locale === "zh-CN"
        ? "此致\nKAT VR 团队\nbusiness@katvr.com"
        : "Best regards,\nKAT VR Team\nbusiness@katvr.com",
    updatedAt: new Date().toISOString(),
  };
}

function renderList() {
  appEls.list.innerHTML = "";

  state.groups.forEach((group) => {
    const li = document.createElement("li");
    li.className = `template-item${group.groupId === state.selectedGroupId ? " active" : ""}`;

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "template-main-btn";
    openBtn.innerHTML = `<strong>${escapeHtml(group.category)}</strong><span>${escapeHtml(
      `${group.groupId}${group.ruleId ? ` · ${group.ruleId}` : ""}`,
    )}</span>`;

    openBtn.addEventListener("click", () => {
      selectGroup(group.groupId, state.selectedLocale);
    });

    const localeSwitch = document.createElement("div");
    localeSwitch.className = "template-locale-switch";

    LOCALE_ORDER.forEach((locale) => {
      const localeBtn = document.createElement("button");
      localeBtn.type = "button";
      localeBtn.className = `template-locale-btn${
        group.groupId === state.selectedGroupId && locale === state.selectedLocale ? " active" : ""
      }`;
      localeBtn.textContent = LOCALE_LABELS[locale];
      localeBtn.addEventListener("click", () => {
        selectGroup(group.groupId, locale);
      });
      localeSwitch.appendChild(localeBtn);
    });

    li.appendChild(openBtn);
    li.appendChild(localeSwitch);
    appEls.list.appendChild(li);
  });
}

function selectGroup(groupId, locale) {
  if (!groupId) return;

  const group = state.groups.find((entry) => entry.groupId === groupId);
  if (!group) return;

  const targetLocale = LOCALE_ORDER.includes(locale) ? locale : state.selectedLocale;
  if (!group.versions[targetLocale]) {
    group.versions[targetLocale] = createDefaultVersion(targetLocale, group.category);
  }

  state.selectedGroupId = groupId;
  state.selectedLocale = targetLocale;

  const version = getSelectedVersion(group, targetLocale);
  if (!version) return;

  setFieldValue(fields.category, group.category);
  setFieldValue(fields.name, version.name);
  setFieldValue(fields.startAt, version.startAt);
  setFieldValue(fields.endAt, version.endAt);
  setFieldValue(fields.scope, version.scope || "external");
  setFieldValue(fields.subject, version.subject);
  setFieldValue(fields.opening, version.opening);
  setFieldValue(fields.body, version.body);
  setFieldValue(fields.signature, version.signature);

  renderLocaleSwitch();
  renderList();
  renderMeta();
  renderPreview();
}

function renderLocaleSwitch() {
  appEls.localeButtons.forEach((button) => {
    const locale = button.dataset.locale;
    const active = locale === state.selectedLocale;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function renderMeta() {
  const group = getSelectedGroup();
  if (!group) return;

  appEls.meta.templateId.textContent = group.groupId || "-";
  appEls.meta.rule.textContent =
    group.ruleId || (group.direction === "sendbox" ? "发件类模板（人工发送）" : "未关联规则");
  appEls.meta.routing.textContent = group.routing || "未指定";
  appEls.meta.sla.textContent = group.sla || "未指定";
  appEls.meta.matchFields.textContent = group.matchFields || "未指定";
  appEls.meta.keywords.textContent = group.keywords || "未指定";
  appEls.meta.exclusions.textContent = group.exclusions || "无";
  appEls.meta.placeholders.textContent = group.placeholders.length > 0 ? group.placeholders.join("，") : "无";
  appEls.meta.note.textContent = group.note || "无";
}

function getSelectedGroup() {
  return state.groups.find((group) => group.groupId === state.selectedGroupId) || null;
}

function getSelectedVersion(group, locale) {
  if (!group) return null;
  return group.versions?.[locale] || null;
}

function writeFormToState(group, version) {
  group.category = getFieldValue(fields.category);
  version.name = getFieldValue(fields.name);
  version.startAt = getFieldValue(fields.startAt);
  version.endAt = getFieldValue(fields.endAt);
  version.scope = getFieldValue(fields.scope);
  version.subject = getFieldValue(fields.subject);
  version.opening = getFieldValue(fields.opening);
  version.body = getFieldValue(fields.body);
  version.signature = getFieldValue(fields.signature);
  version.updatedAt = new Date().toISOString();
  group.updatedAt = version.updatedAt;
}

function buildMailText(version) {
  const lines = [];

  lines.push(version.opening || "");
  lines.push("");
  lines.push(version.body || "");

  if (version.startAt || version.endAt) {
    lines.push("");
    lines.push(`生效时段：${version.startAt || "未设置"} ~ ${version.endAt || "未设置"}`);
  }

  if (version.signature) {
    lines.push("");
    lines.push(version.signature);
  }

  return lines.join("\n").trim();
}

function renderPreview() {
  const group = getSelectedGroup();
  const version = getSelectedVersion(group, state.selectedLocale);
  if (!version) return;

  appEls.previewSubject.textContent = version.subject || "(无主题)";
  appEls.previewBody.textContent = buildMailText(version);
}

function persistLocalGroups() {
  localStorage.setItem(
    STORAGE_KEYS.localTemplateGroups,
    JSON.stringify({
      version: 2,
      updatedAt: new Date().toISOString(),
      groups: state.groups,
    }),
  );
}

function loadLocalGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.localTemplateGroups);
    if (!raw) return [];

    const payload = JSON.parse(raw);
    return parseTemplateGroupsPayload(payload);
  } catch (_error) {
    return [];
  }
}

function restoreActivationPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.activationPrefs);
    if (!raw) return;
    const prefs = JSON.parse(raw);
    state.activationPrefs = {
      targetMailbox: String(prefs.targetMailbox || ""),
      mode: prefs.mode === "all" ? "all" : "current",
    };
  } catch (_error) {
    // Ignore invalid local prefs.
  }
}

function renderActivationPrefs() {
  appEls.targetMailboxInput.value = state.activationPrefs.targetMailbox;
  appEls.activateModeSelect.value = state.activationPrefs.mode;
}

function onActivationPrefChange() {
  state.activationPrefs.targetMailbox = String(appEls.targetMailboxInput.value || "").trim();
  state.activationPrefs.mode = appEls.activateModeSelect.value === "all" ? "all" : "current";
  localStorage.setItem(STORAGE_KEYS.activationPrefs, JSON.stringify(state.activationPrefs));
}

function exportTemplatesAsFile() {
  const payload = {
    version: 2,
    updatedAt: new Date().toISOString(),
    groups: state.groups,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `auto-reply-template-groups-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function onImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const parsed = parseTemplateGroupsPayload(payload);
    if (parsed.length === 0) {
      throw new Error("JSON 中没有可用模板组");
    }

    state.groups = parsed;
    state.selectedGroupId = parsed[0].groupId;
    state.selectedLocale = "zh-CN";
    persistLocalGroups();
    renderList();
    selectGroup(state.selectedGroupId, state.selectedLocale);
    setStatus(appEls.status, `已导入 ${parsed.length} 个模板类别。`, false);
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
  const group = getSelectedGroup();
  const version = getSelectedVersion(group, state.selectedLocale);
  if (!version) return;

  const text = `主题：${version.subject}\n\n${buildMailText(version)}`;
  await copyToClipboard(text, "已复制纯文本。", "复制失败，请检查浏览器权限。");
}

async function copyPreviewHtml() {
  const group = getSelectedGroup();
  const version = getSelectedVersion(group, state.selectedLocale);
  if (!version) return;

  const body = buildMailText(version)
    .split("\n")
    .map((line) => escapeHtml(line))
    .join("<br>");

  const html = `<p><strong>主题：</strong>${escapeHtml(version.subject)}</p><p>${body}</p>`;
  await copyToClipboard(html, "已复制 HTML。", "复制失败，请检查浏览器权限。");
}

async function copyManualSubject() {
  const subject = String(state.activationGuide?.subject || "").trim();
  if (!subject) {
    setStatus(appEls.status, "请先点击“一键在 AliMail 激活”，再复制当前主题。", true);
    return;
  }
  await copyToClipboard(subject, "已复制当前主题。", "复制失败，请检查浏览器权限。");
}

async function copyManualBody() {
  const body = String(state.activationGuide?.bodyText || "").trim();
  if (!body) {
    setStatus(appEls.status, "请先点击“一键在 AliMail 激活”，再复制当前正文。", true);
    return;
  }
  await copyToClipboard(body, "已复制当前正文。", "复制失败，请检查浏览器权限。");
}

async function copyManualPacket() {
  const packetText = String(state.activationGuide?.packetText || "").trim();
  if (!packetText) {
    setStatus(appEls.status, "请先点击“一键在 AliMail 激活”，再复制完整激活包。", true);
    return;
  }
  await copyToClipboard(packetText, "已复制完整激活包。", "复制失败，请检查浏览器权限。");
}

async function activateInAliMail() {
  onActivationPrefChange();
  persistLocalGroups();

  const group = getSelectedGroup();
  const version = getSelectedVersion(group, state.selectedLocale);
  if (!group || !version) {
    setStatus(appEls.status, "未找到可激活的模板。", true);
    return;
  }

  const targetMailbox = state.activationPrefs.targetMailbox;
  if (!isValidEmail(targetMailbox)) {
    setStatus(appEls.status, "请先填写有效的指定邮箱（企业版账号）。", true);
    return;
  }

  const activationEntries = collectTemplatesForActivation(group, version, state.activationPrefs.mode);
  const validation = validateActivationEntries(activationEntries);
  if (validation.errors.length > 0) {
    setStatus(appEls.status, `格式校验失败：${validation.errors.join("；")}`, true);
    return;
  }

  const envelope = buildAliMailActivationEnvelope({
    entries: activationEntries,
    activeGroup: group,
    activeVersion: version,
    targetMailbox,
    mode: state.activationPrefs.mode,
  });
  const packetText = buildManualActivationPacket(envelope, validation.warnings);
  state.activationGuide = {
    subject: envelope.activeTemplate.subject || "",
    bodyText: envelope.activeTemplate.bodyText || "",
    packetText,
  };
  renderManualGuide(targetMailbox, envelope.mode, validation.warnings);

  let copiedPacket = false;
  try {
    await navigator.clipboard.writeText(packetText);
    copiedPacket = true;
  } catch (_error) {
    copiedPacket = false;
  }

  const opened = window.open(ALIMAIL_WEBMAIL_URL, "_blank", "noopener,noreferrer");
  if (!opened) {
    const useCurrentTab = window.confirm(
      "浏览器拦截了新窗口。是否在当前页打开 AliMail 并继续激活？（当前页内容已自动保存）",
    );
    if (useCurrentTab) {
      window.location.assign(ALIMAIL_WEBMAIL_URL);
      return;
    }
    setStatus(appEls.status, "无法打开 AliMail，请允许该站点弹窗后重试。", true);
    return;
  }

  const modeMessage =
    state.activationPrefs.mode === "all"
      ? "已生成全部模板激活包，并定位到当前模板。"
      : "已生成当前模板激活包。";
  const copyMessage = copiedPacket
    ? "完整激活包已复制到剪贴板。"
    : "自动复制失败，请使用下方按钮手动复制主题/正文。";
  const warningMessage = validation.warnings.length > 0 ? ` 注意：${validation.warnings.join("；")}。` : "";

  setStatus(
    appEls.status,
    `${modeMessage}${copyMessage} 请按下方“无插件激活步骤”在 AliMail 保存规则。${warningMessage}`,
    false,
  );
}

function collectTemplatesForActivation(activeGroup, activeVersion, mode) {
  if (mode !== "all") {
    return [
      {
        group: activeGroup,
        version: activeVersion,
      },
    ];
  }

  const entries = [];
  state.groups.forEach((group) => {
    LOCALE_ORDER.forEach((locale) => {
      const version = group.versions?.[locale];
      if (!version) return;
      entries.push({ group, version });
    });
  });
  return entries;
}

function validateActivationEntries(entries) {
  const errors = [];
  const warnings = [];

  entries.forEach(({ group, version }) => {
    const check = validateAliMailFormat(version);
    const prefix = `${group.groupId}/${version.locale}`;
    check.errors.forEach((message) => errors.push(`${prefix}: ${message}`));
    check.warnings.forEach((message) => warnings.push(`${prefix}: ${message}`));
  });

  return { errors, warnings };
}

function validateAliMailFormat(version) {
  const errors = [];
  const warnings = [];

  const subject = String(version.subject || "").trim();
  const body = buildMailText(version);

  if (!subject) {
    errors.push("主题不能为空");
  }
  if (subject.length > 255) {
    warnings.push("主题超过 255 字符，可能被 AliMail 截断");
  }
  if (!body) {
    errors.push("正文不能为空");
  }
  if (body.length > 5000) {
    warnings.push("正文较长，建议在 AliMail 页面确认显示效果");
  }
  if ((version.startAt && !version.endAt) || (!version.startAt && version.endAt)) {
    warnings.push("建议同时设置开始和结束时间");
  }
  if (version.startAt && version.endAt && version.startAt >= version.endAt) {
    errors.push("结束时间必须晚于开始时间");
  }

  const placeholderMatches = body.match(/\{\{[^}]+\}\}/g) || [];
  if (placeholderMatches.length > 0) {
    warnings.push("检测到占位符，AliMail 不会自动替换变量");
  }

  return { errors, warnings };
}

function buildAliMailActivationEnvelope(config) {
  const templates = config.entries.map(({ group, version }) => buildAliMailActivationPayload(group, version));
  const activeTemplate = buildAliMailActivationPayload(config.activeGroup, config.activeVersion);

  return {
    version: 2,
    source: "katvr-autoreply-studio",
    mode: config.mode,
    targetMailbox: config.targetMailbox,
    generatedAt: new Date().toISOString(),
    activeTemplate,
    templates,
  };
}

function buildAliMailActivationPayload(group, version) {
  const plainBody = buildMailText(version);
  return {
    templateId: group.groupId,
    locale: version.locale,
    category: group.category,
    scope: version.scope || "external",
    subject: version.subject || "",
    bodyText: plainBody,
    bodyHtml: plainBody
      .split("\n")
      .map((line) => escapeHtml(line))
      .join("<br>"),
    startAt: version.startAt || null,
    endAt: version.endAt || null,
    generatedAt: new Date().toISOString(),
  };
}

function renderManualGuide(targetMailbox, mode, warnings) {
  if (!appEls.manualGuideBox || !appEls.manualGuideList) {
    return;
  }

  const steps = [
    `确认当前登录邮箱为 ${targetMailbox}。`,
    "进入 AliMail 设置页，找到“收信规则 / 邮件规则 / 过滤器规则”。",
    "新建规则并选择动作“自动回复/回复邮件”（若没有此动作，请联系管理员开通权限）。",
    "把“当前主题”和“当前正文”粘贴进去后保存启用。",
    "用外部邮箱发送测试邮件，确认收到自动回复。",
  ];

  if (mode === "all") {
    steps.splice(4, 0, "你选择了“全部模板”：请使用“完整激活包”按类别逐条建立规则。");
  }
  if (warnings.length > 0) {
    steps.push(`注意：${warnings.join("；")}。`);
  }

  appEls.manualGuideList.innerHTML = "";
  steps.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    appEls.manualGuideList.appendChild(item);
  });
  appEls.manualGuideBox.classList.remove("hidden");
}

function buildManualActivationPacket(envelope, warnings) {
  const lines = [];
  const active = envelope.activeTemplate;

  lines.push("[AliMail 无插件激活包]");
  lines.push(`生成时间：${new Date().toLocaleString("zh-CN")}`);
  lines.push(`目标邮箱：${envelope.targetMailbox}`);
  lines.push(`激活范围：${envelope.mode === "all" ? "全部模板（逐条建立规则）" : "仅当前模板"}`);
  lines.push(`当前模板：${active.templateId} / ${active.locale}`);
  lines.push("");
  lines.push("【当前主题】");
  lines.push(active.subject || "(无主题)");
  lines.push("");
  lines.push("【当前正文】");
  lines.push(active.bodyText || "(空)");

  if (envelope.mode === "all") {
    lines.push("");
    lines.push("【全部模板索引】");
    envelope.templates.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.templateId} / ${item.locale} / ${truncateText(item.subject || "(无主题)", 80)}`,
      );
    });
  }

  if (warnings.length > 0) {
    lines.push("");
    lines.push(`注意：${warnings.join("；")}`);
  }

  return lines.join("\n");
}

function isValidEmail(text) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(text || "").trim());
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

function setFieldValue(element, value) {
  if (!element) return;
  element.value = String(value || "");
}

function getFieldValue(element) {
  return String(element?.value || "");
}

function truncateText(text, maxLength) {
  const value = String(text || "");
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
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
