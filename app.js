const STORAGE_KEYS = {
  localTemplateGroups: "ali_editor_local_template_groups_v2_20260306",
  activationPrefs: "ali_editor_activation_prefs",
  unlockMarker: "ali_editor_unlock_marker",
};
const TEMPLATE_DATA_VERSION = 3;

const LOCALE_ORDER = ["zh-CN", "en-US"];
const LOCALE_LABELS = {
  "zh-CN": "中文",
  "en-US": "English",
};
const ALIMAIL_WEBMAIL_URL = "https://qiye.aliyun.com/alimail/entries/v5.1/mail/inbox/all";
const DEFAULT_KEYWORDS_REGEX_BY_GROUP_ID = {
  TPL_SUPPORT_AFTERSALES_ACK: "/support-detail|support|professionalsupport|shoes|dongle|customer care|spare parts/i",
  TPL_SDK_TECH_ACK: "/sdk|vehicle hub|kat i\\/o|kat gateway|integration|technical compatibility/i",
  TPL_INVOICE_PAYMENT_ACK: "/payment|invoice|\\bPI\\b|proforma|bank account/i",
  TPL_SHIPPING_LOGISTICS_ACK: "/shipping|freight|\\bETA\\b|delivery timeline|forwarder|package/i",
  TPL_QUOTE_PRICING_ACK: "/quote|quotation|\\bRFQ\\b|price list|pricing/i",
  TPL_ORDER_PROCUREMENT_ACK: "/order|purchase|\\bPO\\b|bulk order/i",
  TPL_EDU_TRAINING_ACK: "/educational|training solution|institution|simulation training/i",
  TPL_B2B_BUSINESS_ACK:
    "/business|primeday|primeday-fall|warehouse|fitnessday|memberday|flashsale|kat-walk-mini-s-bfcm|commercial|arcade|reseller|dealer/i",
  TPL_PRODUCT_SELECTION_COMPARE_ACK: "/models-comparison|download/i",
  TPL_WEBSITE_PRODUCT_ACK:
    "/product page form|homepage form|product inquiry|new contact form from (kat-walk-[^\\s]*|kat-pro|kat-loco-s|kat-nexus)|No\\.\\d{5,}/i",
  TPL_PARTNERSHIP_CHANNEL_ACK: "/dealer|creator|distribution|partnership proposal/i",
  TPL_GENERAL_ACK: "/^.+$/i",
};

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

function createEmptyPolicySummary() {
  return {
    title: "",
    sourceFiles: [],
    keywordRegexGuide: {
      purpose: "",
      syntax: "",
      flags: [],
      authoringRules: [],
      examples: [],
    },
    subjectStrategy: {
      source: "",
      editorFallback: "",
    },
    defaultLanguage: "",
    localizeWhen: [],
    placeholderPolicy: {
      principle: "",
      namingRule: "",
      allowed: [],
      banned: [],
      implementationNotes: [],
    },
    dedupeRules: [],
    exclusionRules: [],
    routingGroups: [],
    manualFlowNorms: {
      firstTouch: [],
      secondTouch: [],
      escalation: [],
      signatureControl: [],
      pricingControl: [],
    },
    defaultBlocks: [],
  };
}

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
  editMetaBtn: document.getElementById("editMetaBtn"),
  deleteConfirmModal: document.getElementById("deleteConfirmModal"),
  deleteConfirmText: document.getElementById("deleteConfirmText"),
  deleteConfirmCancelBtn: document.getElementById("deleteConfirmCancelBtn"),
  deleteConfirmOkBtn: document.getElementById("deleteConfirmOkBtn"),
  metaEditorModal: document.getElementById("metaEditorModal"),
  metaEditorForm: document.getElementById("metaEditorForm"),
  metaEditorStatus: document.getElementById("metaEditorStatus"),
  metaEditorCancelBtn: document.getElementById("metaEditorCancelBtn"),
  metaEditorSaveBtn: document.getElementById("metaEditorSaveBtn"),
  metaEditorFields: {
    templateId: document.getElementById("metaEditorTemplateId"),
    ruleId: document.getElementById("metaEditorRuleId"),
    routing: document.getElementById("metaEditorRouting"),
    sla: document.getElementById("metaEditorSla"),
    matchFields: document.getElementById("metaEditorMatchFields"),
    keywords: document.getElementById("metaEditorKeywords"),
    exclusions: document.getElementById("metaEditorExclusions"),
    placeholders: document.getElementById("metaEditorPlaceholders"),
    note: document.getElementById("metaEditorNote"),
  },
  previewSubject: document.getElementById("previewSubject"),
  previewBody: document.getElementById("previewBody"),
  status: document.getElementById("appStatus"),
  copyTextBtn: document.getElementById("copyTextBtn"),
  copyHtmlBtn: document.getElementById("copyHtmlBtn"),
  activateAliMailBtn: document.getElementById("activateAliMailBtn"),
  chipsContainer: document.getElementById("chipContainer"),
  placeholderValuesForm: document.getElementById("placeholderValuesForm"),
  manualGuideBox: document.getElementById("manualGuideBox"),
  manualGuideList: document.getElementById("manualGuideList"),
  copyManualSubjectBtn: document.getElementById("copyManualSubjectBtn"),
  copyManualBodyBtn: document.getElementById("copyManualBodyBtn"),
  copyManualPacketBtn: document.getElementById("copyManualPacketBtn"),
  targetMailboxInput: document.getElementById("targetMailboxInput"),
  activateModeSelect: document.getElementById("activateModeSelect"),
  localeButtons: Array.from(document.querySelectorAll("#editorLocaleSwitch .locale-btn")),
  policySummaryContent: document.getElementById("policySummaryContent"),
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
  policySummary: createEmptyPolicySummary(),
  selectedGroupId: null,
  selectedLocale: "zh-CN",
  focusedField: null,
  pendingDeleteGroupId: null,
  metaEditorGroupId: null,
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
  renderPolicySummary();

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

  appEls.editMetaBtn?.addEventListener("click", openMetaEditor);
  appEls.deleteBtn.addEventListener("click", openDeleteConfirm);
  appEls.deleteConfirmCancelBtn?.addEventListener("click", closeDeleteConfirm);
  appEls.deleteConfirmOkBtn?.addEventListener("click", confirmDeleteGroup);
  appEls.deleteConfirmModal?.addEventListener("click", (event) => {
    if (event.target === appEls.deleteConfirmModal) {
      closeDeleteConfirm();
    }
  });
  appEls.metaEditorCancelBtn?.addEventListener("click", closeMetaEditor);
  appEls.metaEditorSaveBtn?.addEventListener("click", saveMetaEditor);
  appEls.metaEditorForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveMetaEditor();
  });
  appEls.metaEditorModal?.addEventListener("click", (event) => {
    if (event.target === appEls.metaEditorModal) {
      closeMetaEditor();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.pendingDeleteGroupId) {
      closeDeleteConfirm();
      return;
    }
    if (event.key === "Escape" && state.metaEditorGroupId) {
      closeMetaEditor();
    }
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
  appEls.placeholderValuesForm?.addEventListener("input", onPlaceholderValueInput);

  appEls.chipsContainer?.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    if (!state.focusedField) {
      setStatus(appEls.status, "请先点击一个输入框，再插入变量。", true);
      return;
    }
    insertAtCursor(state.focusedField, chip.dataset.token || "");
    state.focusedField.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function openDeleteConfirm() {
  if (!state.selectedGroupId) return;

  if (state.groups.length <= 1) {
    setStatus(appEls.status, "至少保留一个模板类别。", true);
    return;
  }

  const group = getSelectedGroup();
  state.pendingDeleteGroupId = state.selectedGroupId;
  if (appEls.deleteConfirmText) {
    const category = group?.category || "当前类别";
    appEls.deleteConfirmText.textContent = `删除后将移除“${category}”及其中的中英文模板内容，此操作不可撤销。`;
  }
  appEls.deleteConfirmModal?.classList.remove("hidden");
  appEls.deleteConfirmModal?.setAttribute("aria-hidden", "false");
  appEls.deleteConfirmCancelBtn?.focus();
}

function closeDeleteConfirm() {
  state.pendingDeleteGroupId = null;
  appEls.deleteConfirmModal?.classList.add("hidden");
  appEls.deleteConfirmModal?.setAttribute("aria-hidden", "true");
  appEls.deleteBtn?.focus();
}

function openMetaEditor() {
  const group = getSelectedGroup();
  if (!group) return;

  state.metaEditorGroupId = group.groupId;
  setFieldValue(appEls.metaEditorFields.templateId, group.groupId);
  setFieldValue(appEls.metaEditorFields.ruleId, group.ruleId);
  setFieldValue(appEls.metaEditorFields.routing, group.routing);
  setFieldValue(appEls.metaEditorFields.sla, group.sla);
  setFieldValue(appEls.metaEditorFields.matchFields, group.matchFields);
  setFieldValue(appEls.metaEditorFields.keywords, group.keywords);
  setFieldValue(appEls.metaEditorFields.exclusions, group.exclusions);
  setFieldValue(appEls.metaEditorFields.placeholders, group.placeholders.join("\n"));
  setFieldValue(appEls.metaEditorFields.note, group.note);
  setStatus(appEls.metaEditorStatus, "", false);
  appEls.metaEditorModal?.classList.remove("hidden");
  appEls.metaEditorModal?.setAttribute("aria-hidden", "false");
  appEls.metaEditorFields.templateId?.focus();
  appEls.metaEditorFields.templateId?.select();
}

function closeMetaEditor() {
  const wasOpen = Boolean(state.metaEditorGroupId);
  state.metaEditorGroupId = null;
  appEls.metaEditorModal?.classList.add("hidden");
  appEls.metaEditorModal?.setAttribute("aria-hidden", "true");
  setStatus(appEls.metaEditorStatus, "", false);
  if (wasOpen) {
    appEls.editMetaBtn?.focus();
  }
}

function saveMetaEditor() {
  const targetGroupId = state.metaEditorGroupId;
  if (!targetGroupId) return;

  const group = state.groups.find((entry) => entry.groupId === targetGroupId);
  if (!group) {
    closeMetaEditor();
    setStatus(appEls.status, "未找到要更新的模板类别。", true);
    return;
  }

  const nextGroupId = getFieldValue(appEls.metaEditorFields.templateId).trim();
  if (!nextGroupId) {
    setStatus(appEls.metaEditorStatus, "Template ID 不能为空。", true);
    appEls.metaEditorFields.templateId?.focus();
    return;
  }

  const duplicated = state.groups.some(
    (entry) => entry.groupId === nextGroupId && entry.groupId !== targetGroupId,
  );
  if (duplicated) {
    setStatus(appEls.metaEditorStatus, "Template ID 已存在，请使用唯一值。", true);
    appEls.metaEditorFields.templateId?.focus();
    appEls.metaEditorFields.templateId?.select();
    return;
  }

  const rawKeywords = getFieldValue(appEls.metaEditorFields.keywords).trim();
  if (rawKeywords && !isValidRegexText(rawKeywords)) {
    setStatus(appEls.metaEditorStatus, "关键词/正则 请使用标准正则文本格式，例如 /payment|invoice|\\bPI\\b/i", true);
    appEls.metaEditorFields.keywords?.focus();
    return;
  }

  group.groupId = nextGroupId;
  group.ruleId = getFieldValue(appEls.metaEditorFields.ruleId).trim();
  group.routing = getFieldValue(appEls.metaEditorFields.routing).trim();
  group.sla = getFieldValue(appEls.metaEditorFields.sla).trim();
  group.matchFields = getFieldValue(appEls.metaEditorFields.matchFields).trim();
  group.keywords = rawKeywords;
  group.exclusions = getFieldValue(appEls.metaEditorFields.exclusions).trim();
  group.placeholders = parseEditorPlaceholders(getFieldValue(appEls.metaEditorFields.placeholders));
  group.note = getFieldValue(appEls.metaEditorFields.note).trim();
  group.updatedAt = new Date().toISOString();

  if (state.selectedGroupId === targetGroupId) {
    state.selectedGroupId = nextGroupId;
  }
  if (state.pendingDeleteGroupId === targetGroupId) {
    state.pendingDeleteGroupId = nextGroupId;
  }

  persistLocalGroups();
  closeMetaEditor();
  renderList();
  selectGroup(nextGroupId, state.selectedLocale);
  setStatus(appEls.status, "已更新规则元信息。", false);
}

function confirmDeleteGroup() {
  const targetGroupId = state.pendingDeleteGroupId;
  if (!targetGroupId) return;

  state.groups = state.groups.filter((group) => group.groupId !== targetGroupId);
  state.selectedGroupId = state.groups[0]?.groupId || null;
  closeDeleteConfirm();
  persistLocalGroups();
  renderList();
  selectGroup(state.selectedGroupId, state.selectedLocale);
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
  closeDeleteConfirm();
  closeMetaEditor();
  authEls.gate.classList.remove("hidden");
  appEls.app.classList.add("hidden");
  appEls.app.setAttribute("aria-hidden", "true");
  setStatus(appEls.status, "");
}

async function loadInitialGroups() {
  const starter = await readStarterData();
  state.policySummary = starter.policySummary;

  const cached = loadLocalEditorState();
  if (hasPolicySummary(cached.policySummary)) {
    state.policySummary = cached.policySummary;
  }

  if (cached.groups.length > 0) {
    state.groups = cached.groups;
    state.selectedGroupId = cached.groups[0].groupId;
    return;
  }

  state.groups = starter.groups.length > 0 ? starter.groups : [createGroup()];
  state.selectedGroupId = state.groups[0]?.groupId || null;
  persistLocalGroups();
}

async function readStarterData() {
  try {
    const response = await fetch("data/auto-reply-templates.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("starter data missing");
    }

    const payload = await response.json();
    return parseTemplateDataPayload(payload);
  } catch (_error) {
    return {
      groups: [],
      policySummary: createEmptyPolicySummary(),
    };
  }
}

async function resetTemplatesFromStarter() {
  const starter = await readStarterData();
  state.policySummary = starter.policySummary;
  renderPlaceholderValuesEditor();
  renderPolicySummary();

  if (starter.groups.length === 0) {
    setStatus(appEls.status, "恢复失败：默认模板文件不可用。", true);
    return;
  }

  state.groups = starter.groups;
  state.selectedGroupId = starter.groups[0].groupId;
  state.selectedLocale = "zh-CN";
  persistLocalGroups();
  renderList();
  selectGroup(state.selectedGroupId, state.selectedLocale);
  setStatus(appEls.status, "已恢复默认模板。", false);
}

function parseTemplateDataPayload(payload) {
  return {
    groups: parseTemplateGroupsPayload(payload),
    policySummary: normalizePolicySummary(payload?.policySummary),
  };
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

function normalizePolicySummary(input) {
  const fallback = createEmptyPolicySummary();
  if (!input || typeof input !== "object") {
    return fallback;
  }

  const allowedPlaceholders = normalizePlaceholders(input.placeholderPolicy?.allowed);

  return {
    title: String(input.title || fallback.title),
    sourceFiles: normalizeStringArray(input.sourceFiles),
    keywordRegexGuide: {
      purpose: String(input.keywordRegexGuide?.purpose || ""),
      syntax: String(input.keywordRegexGuide?.syntax || ""),
      flags: normalizeStringArray(input.keywordRegexGuide?.flags),
      authoringRules: normalizeStringArray(input.keywordRegexGuide?.authoringRules),
      examples: normalizeStringArray(input.keywordRegexGuide?.examples),
    },
    subjectStrategy: {
      source: String(input.subjectStrategy?.source || ""),
      editorFallback: String(input.subjectStrategy?.editorFallback || ""),
    },
    defaultLanguage: String(input.defaultLanguage || ""),
    localizeWhen: normalizeStringArray(input.localizeWhen),
    placeholderPolicy: {
      principle: String(input.placeholderPolicy?.principle || ""),
      namingRule: String(input.placeholderPolicy?.namingRule || ""),
      allowed: allowedPlaceholders,
      banned: normalizePlaceholders(input.placeholderPolicy?.banned),
      implementationNotes: normalizeStringArray(input.placeholderPolicy?.implementationNotes),
    },
    dedupeRules: normalizeStringArray(input.dedupeRules),
    exclusionRules: normalizeObjectArray(input.exclusionRules, ["id", "reason", "routeTo"]),
    routingGroups: normalizePolicyRoutingGroups(input.routingGroups),
    manualFlowNorms: {
      firstTouch: normalizeStringArray(input.manualFlowNorms?.firstTouch),
      secondTouch: normalizeStringArray(input.manualFlowNorms?.secondTouch),
      escalation: normalizeStringArray(input.manualFlowNorms?.escalation),
      signatureControl: normalizeStringArray(input.manualFlowNorms?.signatureControl),
      pricingControl: normalizeStringArray(input.manualFlowNorms?.pricingControl),
    },
    defaultBlocks: ensureDefaultBlockCoverage(normalizePolicyDefaults(input.defaultBlocks), allowedPlaceholders),
  };
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
        keywords: migrateKeywordsText(item.keywords, groupId),
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
    keywords: migrateKeywordsText(input.keywords, groupId),
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
    return parseEditorPlaceholders(input);
  }

  return [];
}

function parseEditorPlaceholders(input) {
  return String(input || "")
    .split(/[\n,，]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function migrateKeywordsText(input, groupId = "") {
  const raw = String(input || "").trim();
  if (!raw) {
    return "";
  }
  if (isValidRegexText(raw)) {
    return raw;
  }
  return getDefaultKeywordsRegex(groupId) || raw;
}

function getDefaultKeywordsRegex(groupId) {
  return DEFAULT_KEYWORDS_REGEX_BY_GROUP_ID[String(groupId || "").trim()] || "";
}

function isValidRegexText(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    return false;
  }

  const match = raw.match(/^\/([\s\S]*)\/([a-z]*)$/);
  if (!match) {
    return false;
  }

  try {
    // Validate user-entered regex text without executing it.
    new RegExp(match[1], match[2]);
    return true;
  } catch (_error) {
    return false;
  }
}

function normalizeStringArray(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.map((entry) => String(entry).trim()).filter(Boolean);
}

function normalizeObjectArray(input, keys) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => {
      const normalized = {};
      keys.forEach((key) => {
        normalized[key] = String(entry[key] || "");
      });
      return normalized;
    });
}

function normalizePolicyRoutingGroups(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      id: String(entry.id || ""),
      label: String(entry.label || ""),
      mailbox: String(entry.mailbox || ""),
      handles: normalizeStringArray(entry.handles),
    }));
}

function normalizePolicyDefaults(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      token: String(entry.token || ""),
      value: String(entry.value || ""),
    }))
    .filter((entry) => entry.token || entry.value);
}

function ensureDefaultBlockCoverage(defaultBlocks, allowedPlaceholders = []) {
  const merged = new Map();

  defaultBlocks.forEach((entry) => {
    const token = String(entry.token || "").trim();
    if (!token || merged.has(token)) return;
    merged.set(token, {
      token,
      value: String(entry.value || ""),
    });
  });

  allowedPlaceholders.forEach((token) => {
    const normalizedToken = String(token || "").trim();
    if (!normalizedToken || merged.has(normalizedToken)) return;
    merged.set(normalizedToken, {
      token: normalizedToken,
      value: "",
    });
  });

  return Array.from(merged.values());
}

function createGroup() {
  const now = new Date().toISOString();
  const label = `新类别 ${new Date().toLocaleDateString("zh-CN")}`;
  const defaultPlaceholders =
    state.policySummary.placeholderPolicy.allowed.length > 0
      ? state.policySummary.placeholderPolicy.allowed.slice(0, 4)
      : [];

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
    placeholders: defaultPlaceholders,
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
    subject: locale === "zh-CN" ? "回复：已收到您发给 KAT VR 的邮件" : "Re: KAT VR inquiry received",
    opening: locale === "zh-CN" ? "您好，" : "Hello,",
    body:
      locale === "zh-CN"
        ? "感谢您联系 KAT VR。\n\n我们已收到您的留言，相关团队会尽快查看并跟进。"
        : "Thank you for contacting KAT VR.\n\nWe have received your message and our team will review it shortly.",
    signature:
      locale === "zh-CN"
        ? "此致\n{{OurReplySignature}}"
        : "Best regards,\n{{OurReplySignature}}",
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
  renderPlaceholderChips();
  renderPlaceholderValuesEditor();
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

function renderPlaceholderChips() {
  if (!appEls.chipsContainer) return;

  const group = getSelectedGroup();
  const preferredTokens = group?.placeholders?.length
    ? group.placeholders
    : state.policySummary.placeholderPolicy.allowed;

  appEls.chipsContainer.innerHTML = "";
  preferredTokens.forEach((token) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.token = token;
    chip.textContent = token.replace(/[{}]/g, "");
    appEls.chipsContainer.appendChild(chip);
  });
}

function renderPlaceholderValuesEditor() {
  if (!appEls.placeholderValuesForm) return;

  const group = getSelectedGroup();
  const currentTokens = new Set(group?.placeholders || []);
  const defaultBlocks = ensureDefaultBlockCoverage(
    state.policySummary.defaultBlocks,
    state.policySummary.placeholderPolicy.allowed,
  );

  appEls.placeholderValuesForm.innerHTML = "";

  defaultBlocks.forEach((item) => {
    const card = document.createElement("label");
    card.className = "placeholder-value-card";

    const head = document.createElement("div");
    head.className = "placeholder-value-head";

    const token = document.createElement("code");
    token.className = "placeholder-token";
    token.textContent = item.token;
    head.appendChild(token);

    if (currentTokens.has(item.token)) {
      const badge = document.createElement("span");
      badge.className = "placeholder-badge";
      badge.textContent = "当前模板";
      head.appendChild(badge);
    }

    const textarea = document.createElement("textarea");
    textarea.className = "placeholder-value-input";
    textarea.rows = item.value && item.value.length > 120 ? 5 : 4;
    textarea.dataset.token = item.token;
    textarea.placeholder = "填写该占位符在预览、复制和激活时应替换成的实际信息";
    textarea.value = item.value || "";

    card.appendChild(head);
    card.appendChild(textarea);
    appEls.placeholderValuesForm.appendChild(card);
  });
}

function renderPolicySummary() {
  if (!appEls.policySummaryContent) return;

  const policy = state.policySummary;
  const sections = [
    buildPolicySection("关键词/正则", [
      policy.keywordRegexGuide.purpose,
      policy.keywordRegexGuide.syntax,
      ...policy.keywordRegexGuide.flags.map((item) => `Flags：${item}`),
      ...policy.keywordRegexGuide.authoringRules,
      ...policy.keywordRegexGuide.examples.map((item) => `示例：${item}`),
    ]),
    buildPolicySection("来源与主题策略", [
      policy.sourceFiles.length > 0 ? `来源文件：${policy.sourceFiles.join(" + ")}` : "",
      policy.defaultLanguage ? `默认语言：${policy.defaultLanguage}` : "",
      ...policy.localizeWhen.map((item) => `切换语言条件：${item}`),
      policy.subjectStrategy.source,
      policy.subjectStrategy.editorFallback,
    ]),
    buildPolicySection("占位符政策", [
      policy.placeholderPolicy.principle,
      policy.placeholderPolicy.namingRule,
      policy.placeholderPolicy.implementationNotes.join(" "),
      policy.placeholderPolicy.allowed.length > 0
        ? `允许变量：${policy.placeholderPolicy.allowed.join("，")}`
        : "",
      policy.placeholderPolicy.banned.length > 0
        ? `禁用变量：${policy.placeholderPolicy.banned.join("，")}`
        : "",
    ]),
    buildPolicySection("去重与排除", [
      ...policy.dedupeRules,
      ...policy.exclusionRules.map((rule) => `${rule.id}：${rule.reason}`),
    ]),
    buildPolicySection(
      "路由团队",
      policy.routingGroups.map((group) =>
        [group.label, group.mailbox, group.handles.join(" / ")].filter(Boolean).join(" | "),
      ),
    ),
    buildPolicySection("人工跟进规范", [
      ...policy.manualFlowNorms.firstTouch,
      ...policy.manualFlowNorms.secondTouch,
      ...policy.manualFlowNorms.escalation,
      ...policy.manualFlowNorms.signatureControl,
      ...policy.manualFlowNorms.pricingControl,
    ]),
    buildPolicySection(
      "默认信息块",
      policy.defaultBlocks.map(
        (item) => `<span class="policy-token">${escapeHtml(item.token)}</span> = ${escapeHtml(item.value)}`,
      ),
      true,
    ),
  ]
    .filter(Boolean)
    .join("");

  appEls.policySummaryContent.innerHTML = sections;
}

function buildPolicySection(title, items, trustedHtml = false) {
  const normalizedItems = items.filter(Boolean);
  if (normalizedItems.length === 0) {
    return "";
  }

  const content = normalizedItems
    .map((item) => `<li>${trustedHtml ? item : escapeHtml(item)}</li>`)
    .join("");

  return `<details class="policy-section" open><summary>${escapeHtml(title)}</summary><ul>${content}</ul></details>`;
}

function hasPolicySummary(policySummary) {
  return Boolean(
    policySummary?.title ||
      policySummary?.keywordRegexGuide?.purpose ||
      policySummary?.placeholderPolicy?.allowed?.length ||
      policySummary?.routingGroups?.length ||
      policySummary?.defaultBlocks?.length,
  );
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

  lines.push(resolvePlaceholderText(version.opening || ""));
  lines.push("");
  lines.push(resolvePlaceholderText(version.body || ""));

  if (version.startAt || version.endAt) {
    lines.push("");
    lines.push(`生效时段：${version.startAt || "未设置"} ~ ${version.endAt || "未设置"}`);
  }

  if (version.signature) {
    lines.push("");
    lines.push(resolvePlaceholderText(version.signature));
  }

  return lines.join("\n").trim();
}

function renderPreview() {
  const group = getSelectedGroup();
  const version = getSelectedVersion(group, state.selectedLocale);
  if (!version) return;

  appEls.previewSubject.textContent = resolveTemplateSubject(version) || "(无主题)";
  appEls.previewBody.textContent = buildMailText(version);
}

function persistLocalGroups() {
  localStorage.setItem(
    STORAGE_KEYS.localTemplateGroups,
    JSON.stringify({
      version: TEMPLATE_DATA_VERSION,
      updatedAt: new Date().toISOString(),
      groups: state.groups,
      policySummary: state.policySummary,
    }),
  );
}

function loadLocalEditorState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.localTemplateGroups);
    if (!raw) {
      return {
        groups: [],
        policySummary: createEmptyPolicySummary(),
      };
    }

    const payload = JSON.parse(raw);
    return {
      groups: parseTemplateGroupsPayload(payload),
      policySummary: normalizePolicySummary(payload?.policySummary),
    };
  } catch (_error) {
    return {
      groups: [],
      policySummary: createEmptyPolicySummary(),
    };
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

function onPlaceholderValueInput(event) {
  const input = event.target.closest("[data-token]");
  if (!input) return;

  const token = String(input.dataset.token || "").trim();
  if (!token) return;

  const existing = state.policySummary.defaultBlocks.find((item) => item.token === token);
  if (existing) {
    existing.value = String(input.value || "");
  } else {
    state.policySummary.defaultBlocks.push({
      token,
      value: String(input.value || ""),
    });
  }

  state.policySummary.defaultBlocks = ensureDefaultBlockCoverage(
    state.policySummary.defaultBlocks,
    state.policySummary.placeholderPolicy.allowed,
  );

  persistLocalGroups();
  renderPolicySummary();
  renderPreview();
}

function exportTemplatesAsFile() {
  const payload = {
    version: TEMPLATE_DATA_VERSION,
    updatedAt: new Date().toISOString(),
    groups: state.groups,
    policySummary: state.policySummary,
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
    const parsed = parseTemplateDataPayload(payload);
    if (parsed.groups.length === 0) {
      throw new Error("JSON 中没有可用模板组");
    }

    state.groups = parsed.groups;
    if (hasPolicySummary(parsed.policySummary)) {
      state.policySummary = parsed.policySummary;
    }
    state.selectedGroupId = parsed.groups[0].groupId;
    state.selectedLocale = "zh-CN";
    persistLocalGroups();
    renderPolicySummary();
    renderList();
    selectGroup(state.selectedGroupId, state.selectedLocale);
    setStatus(appEls.status, `已导入 ${parsed.groups.length} 个模板类别。`, false);
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

  const text = `主题：${resolveTemplateSubject(version)}\n\n${buildMailText(version)}`;
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

  const html = `<p><strong>主题：</strong>${escapeHtml(resolveTemplateSubject(version))}</p><p>${body}</p>`;
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

  const subject = resolveTemplateSubject(version).trim();
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
    subject: resolveTemplateSubject(version),
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

function resolveTemplateSubject(version) {
  return resolvePlaceholderText(version?.subject || "");
}

function resolvePlaceholderText(input) {
  const defaultBlocks = ensureDefaultBlockCoverage(
    state.policySummary.defaultBlocks,
    state.policySummary.placeholderPolicy.allowed,
  );

  return defaultBlocks.reduce((output, item) => {
    if (!item.token) return output;
    return output.split(item.token).join(item.value || item.token);
  }, String(input || ""));
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
