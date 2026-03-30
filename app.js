const STORAGE_KEYS = {
  localTemplateGroups: "ali_editor_local_template_groups_v3_20260308",
  activationPrefs: "ali_editor_activation_prefs",
  unlockMarker: "ali_editor_unlock_marker",
  themeMode: "ali_editor_theme_mode",
};
const TEMPLATE_DATA_VERSION = 4;

const LOCALE_ORDER = ["zh-CN", "en-US"];
const LOCALE_LABELS = {
  "zh-CN": "中文",
  "en-US": "English",
};
const ALIMAIL_WEBMAIL_URL = "https://qiye.aliyun.com/alimail/entries/v5.1/mail/inbox/all";
const DEFAULT_KEYWORDS_REGEX_BY_GROUP_ID = {
  TPL_SUPPORT_AFTERSALES_ACK:
    "/(support-detail|professionalsupport|customer care|\\bafter[- ]?sales\\b|\\bwarranty\\b|\\bdongle\\b|\\bspare parts?\\b|\\breplacement parts?\\b|\\bshoe sensors?\\b|\\blost\\b.*\\b(sensor|shoe|dongle|part)\\b|\\bbroken\\b.*\\b(part|sensor|dongle|shoe)\\b)/i",
  TPL_SDK_TECH_ACK:
    "/(\\bsdk\\b|\\bapi\\b|\\bcode\\b|\\bunity\\b|\\bunreal\\b|\\bdocs?\\b|\\bdocumentation\\b|\\bkat i\\/o\\b|\\bkat gateway\\b|\\bvehicle hub\\b|\\bnexus\\b|\\bplugin\\b|\\blicen[sc]e\\b|\\bfirmware\\b|\\bdriver\\b|\\bintegration\\b|\\btechnical compatibility\\b)/i",
  TPL_INVOICE_PAYMENT_ACK:
    "/(\\bpayment(?: terms?)?\\b|\\binvoice\\b|\\bproforma(?: invoice)?\\b|\\bPI\\b|\\bbank (?:account|details?)\\b|\\bwire transfer\\b|\\bremit\\b|\\bbeneficiary\\b)/i",
  TPL_SHIPPING_LOGISTICS_ACK:
    "/(\\bshipping(?: cost| fee)?\\b|\\bship(?:ping)?\\b|\\bfreight\\b|\\bETA\\b|\\bdelivery(?: timeline| time| option)?s?\\b|\\blead time\\b|\\bforwarder\\b|\\bcustoms\\b|\\bair freight\\b|\\bsea freight\\b|\\bassembly\\b|\\binstall(?:ation)?\\b|\\bDDP\\b|\\bEXW\\b|\\bFCA\\b|\\bCIF\\b)/i",
  TPL_QUOTE_PRICING_ACK:
    "/(\\bquote\\b|\\bquotation\\b|\\bRFQ\\b|\\bprice list\\b|\\bpricing\\b|\\bprice\\b|\\bcost\\b|\\bMOQ\\b|\\bminimum order quantity\\b)/i",
  TPL_ORDER_PROCUREMENT_ACK:
    "/(\\border\\b|\\bpurchas(?:e|ing|ed)\\b|\\bprocurement\\b|\\bPO\\b|\\bpurchase order\\b|\\bbulk order\\b|\\bbulk purchase\\b|\\border cancellation\\b|\\brefund status\\b)/i",
  TPL_EDU_TRAINING_ACK:
    "/(\\beducation(?:al)?\\b|\\btraining(?: solution)?\\b|\\binstitution(?:s)?\\b|\\bhigher education\\b|\\buniversity\\b|\\bcollege\\b|\\bschool\\b|\\bfaculty\\b|\\blecturer\\b|\\bclassroom\\b|\\bimmersive history\\b|\\bsimulation training\\b)/i",
  TPL_B2B_BUSINESS_ACK:
    "/(primeday(?:-fall)?|fitnessday|memberday|flashsale|kat-walk-mini-s-bfcm|\\bvr arcade\\b|\\barcade\\b|\\bcommercial(?: use| deployment)?\\b|\\bvr business\\b|\\bbusiness inquiry\\b|\\bbusiness solution\\b|\\bfor business use\\b|\\bbuisness\\b|\\breseller\\b|\\bwholesale\\b|\\bvenue\\b)/i",
  TPL_PRODUCT_SELECTION_COMPARE_ACK:
    "/(models-comparison|download|\\bcompare\\b|\\bcomparison\\b|\\bdifference between\\b|\\bwhich model\\b|\\bproduct selection\\b|\\bkat walk mini s\\b.*\\b(c2|c2pe|c2 core|c2 plus)\\b|\\b(c2|c2pe|c2 core|c2 plus)\\b.*\\bkat walk mini s\\b)/i",
  TPL_WEBSITE_PRODUCT_ACK:
    "/(product page form|homepage form|product inquiry|new contact form from (kat-walk-[^\\s]*|kat-pro|kat-loco-s|kat-nexus)|\\binterested in your products?\\b|\\binquiry about\\b.*\\bkat\\b|\\bkat walk\\b|\\bvr treadmill\\b|\\bvr treamill\\b|\\bkat walk mini s\\b|\\bkat walk c2\\b|\\babout the kat walk\\b)/i",
  TPL_PARTNERSHIP_CHANNEL_ACK:
    "/(\\bpartnership(?: proposal| inquiry)?\\b|\\bpartner(?:ship)?\\b|\\bcollab(?:oration)?\\b|\\bcreator\\b|\\binfluencer\\b|\\bdistribution\\b|\\bdistributor\\b|\\bauthorized dealer\\b|\\bdealer\\b|\\bchannel partner\\b)/i",
  TPL_GENERAL_ACK: "/^.+$/i",
};
const PLACEHOLDER_ALIASES = {
  "{{OurRecommendedProduct}}": "推荐产品",
  "{{OurProductPositioning}}": "产品定位",
  "{{OurProductHighlights}}": "产品亮点",
  "{{OurPortfolioBlock}}": "产品线概览",
  "{{OurBusinessSolutionBlock}}": "商业方案摘要",
  "{{OurCompatibilityOrSoftwareInfo}}": "兼容性 / 软件说明",
  "{{OurShippingLeadTimeNote}}": "交付与时效说明",
  "{{OurWarrantyOrSupportInfo}}": "售后与支持说明",
  "{{OurSupportContactBlock}}": "官方支持联系方式",
  "{{OurPaymentSecurityNotice}}": "付款安全提醒",
  "{{OurCatalogOrPageURL}}": "资料页 / 产品页链接",
  "{{OurReplySignature}}": "回复签名",
};
const LEGACY_DEFAULT_BLOCK_VALUES = {
  "{{OurBusinessSolutionBlock}}": [
    "KAT VR business solutions cover VR treadmills and motion systems for arcades, training and commercial deployment.",
  ],
  "{{OurCompatibilityOrSoftwareInfo}}": [
    "KAT Unity SDK supports all KAT VR product lines. Consumer products use KAT Gateway, while professional products use KAT I/O.",
  ],
  "{{OurShippingLeadTimeNote}}": [
    "We normally support EXW and can also coordinate FCA/CIF/DDP when needed. Production and transit timing will be confirmed by our team in follow-up.",
  ],
  "{{OurPaymentSecurityNotice}}": [
    "Please remit only to the official company bank account under Hangzhou Virtual And Reality Technology Co., Ltd. / 杭州虚现科技股份有限公司. We do not accept cryptocurrency or unverified bank-account changes sent by email alone.",
  ],
};
const DETAILED_PLUGIN_GUIDE_SECTIONS = [
  {
    title: "0. 快速操作说明",
    items: [
      "先在桌面版 Edge 或 Chrome 安装 Tampermonkey 扩展。",
      "再安装 `KATVR AliMail Auto Reply Activator` 脚本，并确认脚本已启用。",
      "手动登录一次阿里企业邮箱网页，然后刷新该页面，让脚本接管当前域名。",
      "回到编辑器，填写“指定邮箱（企业版账号）”，并把模板里的占位符实际信息补齐。",
      "点击 `一键在 AliMail 激活（有插件）`，等待浏览器打开 AliMail 页面。",
      "如果页面出现 `AliMail 激活器：开始处理激活请求...`，说明插件已开始执行；最后检查内容是否已保存，并用测试邮件验收。",
    ],
  },
  {
    title: "1. 先选浏览器",
    items: [
      "优先使用桌面版 Chromium 浏览器，例如 Microsoft Edge 或 Google Chrome。",
      "尽量不要用手机浏览器；手机端通常无法稳定安装和运行 Tampermonkey。",
      "如果你的办公电脑被公司策略禁止安装浏览器扩展，需要先让 IT 开通扩展安装权限。",
    ],
  },
  {
    title: "2. 安装 Tampermonkey 扩展",
    items: [
      "打开浏览器扩展商店，搜索 `Tampermonkey`。",
      "确认开发者和扩展名称无误后，点击安装 / 添加到浏览器。",
      "安装完成后，把 Tampermonkey 图标固定到浏览器工具栏，方便后续检查脚本是否已启用。",
    ],
  },
  {
    title: "3. 安装 KATVR 激活脚本",
    items: [
      "在同一个浏览器里打开以下脚本地址：",
      "https://raw.githubusercontent.com/YJLi-new/autoresponder-editor/main/alimail-activator.user.js",
      "页面跳转到 Tampermonkey 安装确认页后，检查脚本名是 `KATVR AliMail Auto Reply Activator`，再点击安装。",
      "安装后进入 Tampermonkey Dashboard，确认这个脚本处于启用状态。",
    ],
  },
  {
    title: "4. 首次安装后做一次环境确认",
    items: [
      "先手动打开并登录阿里邮箱企业版网页。",
      "确认网址是 `https://qiye.aliyun.com/...` 或 `https://mail.aliyun.com/...` 之一。",
      "登录后刷新一次页面，让新安装的脚本接管当前域名。",
      "如果浏览器提示本站点弹窗被拦截，请先允许，否则编辑器无法自动打开 AliMail 页面。",
    ],
  },
  {
    title: "5. 回到模板编辑器做激活前准备",
    items: [
      "在右侧填写“指定邮箱（企业版账号）”，确保它就是你要应用自动回复的真实邮箱。",
      "把当前模板的主题、正文、签名检查一遍。",
      "到“占位符实际信息”模块里，把当前模板会用到的 `{{Our*}}` 占位符都填成实际内容。",
      "如果你选择“全部模板”，要确认当前站点里所有模板都已经整理完成。",
    ],
  },
  {
    title: "6. 触发有插件激活",
    items: [
      "点击右侧的 `一键在 AliMail 激活（有插件）` 按钮。",
      "编辑器会先保存当前内容、生成激活载荷，并尝试打开 AliMail 页面。",
      "如果浏览器拦截新窗口，按页面提示允许弹窗，或选择当前页继续打开。",
    ],
  },
  {
    title: "7. AliMail 页面上会发生什么",
    items: [
      "如果脚本运行正常，页面会出现提示：`AliMail 激活器：开始处理激活请求...`。",
      "脚本会尝试识别你当前登录的邮箱是否与编辑器里填写的目标邮箱一致。",
      "随后脚本会尝试打开自动回复设置页、填写主题和正文，并在可能时自动点击保存。",
      "如果页面结构变化导致找不到某个按钮，脚本可能只能填写内容，最后一步需要你手动点保存。",
    ],
  },
  {
    title: "8. 激活完成后如何验收",
    items: [
      "页面出现 `AliMail 激活器：已激活当前模板。` 或类似成功提示。",
      "进入 AliMail 自动回复设置，检查主题和正文是否已经是最终文字，而不是 `{{Our*}}` 占位符。",
      "用外部邮箱给目标邮箱发一封测试邮件，确认能收到最新自动回复。",
    ],
  },
  {
    title: "9. 常见问题排查",
    items: [
      "如果 AliMail 页面完全没有出现 `AliMail 激活器` 提示，通常是脚本没启用、域名不匹配，或当前浏览器不是装脚本的那个浏览器。",
      "如果出现“检测到未填写占位符”的提示，说明你还有 `{{Our*}}` 没填，需要先回编辑器补完“占位符实际信息”。",
      "如果脚本提示找不到自动回复入口或保存按钮，通常是 AliMail 页面结构变了；这时先手动保存，再反馈给维护者更新脚本。",
      "如果一直被弹窗拦截，先在浏览器地址栏附近允许本站弹窗，再重新点击激活。",
    ],
  },
];
const RULE_ENGINE_SECTIONS = {
  exclusions: {
    title: "全局排除",
    intro: "命中这些规则时，不建议发送自动回复。用于挡住系统通知、供应商注册、SEO 外链这类不应回复的邮件。",
  },
  overrides: {
    title: "覆盖规则",
    intro: "当某些页面 slug 被误用，或同一封邮件同时带有多个信号时，用覆盖规则把它强制切到更合适的模板。",
  },
  reviewRules: {
    title: "人工复核",
    intro: "这类规则会把高风险线索先标记为人工判断，不直接归入产品或销售模板。",
  },
  productProfiles: {
    title: "产品识别",
    intro: "这里只维护产品页 slug 和高置信度产品词，用于后续结构化消费；当前站点正文仍默认走中性回法。",
  },
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
    pluginActivationGuide: {
      overview: "",
      installSteps: [],
      usageSteps: [],
      successChecks: [],
      troubleshooting: [],
    },
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

function createEmptyClassificationRules() {
  return {
    exclusions: [],
    overrides: [],
    reviewRules: [],
    productProfiles: [],
    resolutionPolicy: {
      mode: "neutral_unless_exact_match",
      precedence: ["pagePattern", "contentPattern"],
      multiMatchBehavior: "neutral",
      familyMatchBehavior: "neutral",
      noMatchBehavior: "neutral",
    },
  };
}

const appEls = {
  app: document.getElementById("editorApp"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeToggleLabel: document.getElementById("themeToggleLabel"),
  list: document.getElementById("templateList"),
  form: document.getElementById("templateForm"),
  addBtn: document.getElementById("addTemplateBtn"),
  deleteBtn: document.getElementById("deleteTemplateBtn"),
  exportBtn: document.getElementById("exportBtn"),
  exportRuleDraftBtn: document.getElementById("exportRuleDraftBtn"),
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
  pluginGuideBtn: document.getElementById("pluginGuideBtn"),
  pluginGuideModal: document.getElementById("pluginGuideModal"),
  pluginGuideContent: document.getElementById("pluginGuideContent"),
  pluginGuideCloseBtn: document.getElementById("pluginGuideCloseBtn"),
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
  ruleEngineGrid: document.getElementById("ruleEngineGrid"),
  ruleEngineModal: document.getElementById("ruleEngineModal"),
  ruleEngineForm: document.getElementById("ruleEngineForm"),
  ruleEngineTitle: document.getElementById("ruleEngineTitle"),
  ruleEngineIntro: document.getElementById("ruleEngineIntro"),
  ruleEngineEditorBody: document.getElementById("ruleEngineEditorBody"),
  ruleEngineStatus: document.getElementById("ruleEngineStatus"),
  ruleEngineCancelBtn: document.getElementById("ruleEngineCancelBtn"),
  ruleEngineSaveBtn: document.getElementById("ruleEngineSaveBtn"),
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
  classificationRules: createEmptyClassificationRules(),
  theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  selectedGroupId: null,
  selectedLocale: "zh-CN",
  focusedField: null,
  pendingDeleteGroupId: null,
  pluginGuideOpen: false,
  metaEditorGroupId: null,
  ruleEditorSection: null,
  activationGuide: null,
  activationPrefs: {
    targetMailbox: "",
    mode: "current",
  },
};

boot();

async function boot() {
  applyTheme(resolveInitialTheme(), false);
  bindEvents();
  setStatus(authEls.status, "正在加载访问配置...");

  await Promise.all([loadInitialGroups(), loadAccessConfig()]);
  restoreActivationPrefs();
  renderActivationPrefs();
  renderRuleEngine();
  renderPolicySummary();
  renderPluginGuideModal();
  renderManualGuide(state.activationPrefs.targetMailbox, state.activationPrefs.mode, []);

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
  appEls.themeToggleBtn?.addEventListener("click", toggleTheme);

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
  appEls.pluginGuideBtn?.addEventListener("click", openPluginGuideModal);
  appEls.pluginGuideCloseBtn?.addEventListener("click", closePluginGuideModal);
  appEls.pluginGuideModal?.addEventListener("click", (event) => {
    if (event.target === appEls.pluginGuideModal) {
      closePluginGuideModal();
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
  appEls.ruleEngineGrid?.addEventListener("click", onRuleEngineGridClick);
  appEls.ruleEngineEditorBody?.addEventListener("click", onRuleEngineEditorClick);
  appEls.ruleEngineCancelBtn?.addEventListener("click", closeRuleEditor);
  appEls.ruleEngineSaveBtn?.addEventListener("click", saveRuleEditor);
  appEls.ruleEngineForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveRuleEditor();
  });
  appEls.ruleEngineModal?.addEventListener("click", (event) => {
    if (event.target === appEls.ruleEngineModal) {
      closeRuleEditor();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.pendingDeleteGroupId) {
      closeDeleteConfirm();
      return;
    }
    if (event.key === "Escape" && state.pluginGuideOpen) {
      closePluginGuideModal();
      return;
    }
    if (event.key === "Escape" && state.metaEditorGroupId) {
      closeMetaEditor();
      return;
    }
    if (event.key === "Escape" && state.ruleEditorSection) {
      closeRuleEditor();
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
  appEls.exportRuleDraftBtn?.addEventListener("click", exportClassificationRuleDraft);
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

function resolveInitialTheme() {
  const current = document.documentElement.dataset.theme;
  if (current === "light" || current === "dark") {
    return current;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.themeMode);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch (_error) {
    // Ignore theme storage errors.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function toggleTheme() {
  applyTheme(state.theme === "dark" ? "light" : "dark");
}

function applyTheme(theme, persist = true) {
  const normalized = theme === "dark" ? "dark" : "light";
  state.theme = normalized;
  document.documentElement.dataset.theme = normalized;
  document.documentElement.style.colorScheme = normalized;

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEYS.themeMode, normalized);
    } catch (_error) {
      // Ignore theme storage errors.
    }
  }

  renderThemeToggle();
}

function renderThemeToggle() {
  if (!appEls.themeToggleBtn) return;

  const nextTheme = state.theme === "dark" ? "light" : "dark";
  const label = nextTheme === "dark" ? "切换到深色主题" : "切换到浅色主题";
  appEls.themeToggleBtn.setAttribute("aria-label", label);
  appEls.themeToggleBtn.setAttribute("title", label);
  appEls.themeToggleBtn.setAttribute("aria-pressed", String(state.theme === "dark"));
  if (appEls.themeToggleLabel) {
    appEls.themeToggleLabel.textContent = label;
  }
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

function renderPluginGuideModal() {
  if (!appEls.pluginGuideContent) return;

  const html = DETAILED_PLUGIN_GUIDE_SECTIONS.map((section) => {
    const items = section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    return `<section class="guide-section"><h4>${escapeHtml(section.title)}</h4><ol>${items}</ol></section>`;
  }).join("");

  appEls.pluginGuideContent.innerHTML = html;
}

function openPluginGuideModal() {
  state.pluginGuideOpen = true;
  appEls.pluginGuideModal?.classList.remove("hidden");
  appEls.pluginGuideModal?.setAttribute("aria-hidden", "false");
  appEls.pluginGuideCloseBtn?.focus();
}

function closePluginGuideModal(restoreFocus = true) {
  if (!state.pluginGuideOpen) return;
  state.pluginGuideOpen = false;
  appEls.pluginGuideModal?.classList.add("hidden");
  appEls.pluginGuideModal?.setAttribute("aria-hidden", "true");
  if (restoreFocus) {
    appEls.pluginGuideBtn?.focus();
  }
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
  closePluginGuideModal(false);
  closeMetaEditor();
  closeRuleEditor(false);
  authEls.gate.classList.remove("hidden");
  appEls.app.classList.add("hidden");
  appEls.app.setAttribute("aria-hidden", "true");
  setStatus(appEls.status, "");
}

async function loadInitialGroups() {
  const starter = await readStarterData();

  const cached = loadLocalEditorState();
  state.policySummary = mergePolicySummaryWithStarter(starter.policySummary, cached.policySummary);
  state.classificationRules = mergeClassificationRulesWithStarter(
    starter.classificationRules,
    cached.classificationRules,
  );

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
      classificationRules: createEmptyClassificationRules(),
    };
  }
}

async function resetTemplatesFromStarter() {
  const starter = await readStarterData();
  state.policySummary = starter.policySummary;
  state.classificationRules = starter.classificationRules;
  renderPlaceholderValuesEditor();
  renderRuleEngine();
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
    classificationRules: normalizeClassificationRules(payload?.classificationRules),
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
    pluginActivationGuide: {
      overview: String(input.pluginActivationGuide?.overview || ""),
      installSteps: normalizeStringArray(input.pluginActivationGuide?.installSteps),
      usageSteps: normalizeStringArray(input.pluginActivationGuide?.usageSteps),
      successChecks: normalizeStringArray(input.pluginActivationGuide?.successChecks),
      troubleshooting: normalizeStringArray(input.pluginActivationGuide?.troubleshooting),
    },
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

function normalizeClassificationRules(input) {
  const fallback = createEmptyClassificationRules();
  if (!input || typeof input !== "object") {
    return fallback;
  }

  return {
    exclusions: normalizeClassificationExclusions(input.exclusions),
    overrides: normalizeClassificationOverrides(input.overrides),
    reviewRules: normalizeClassificationReviewRules(input.reviewRules),
    productProfiles: normalizeProductProfiles(input.productProfiles),
    resolutionPolicy: normalizeResolutionPolicy(input.resolutionPolicy),
  };
}

function normalizeClassificationExclusions(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      id: String(entry.id || "").trim(),
      label: String(entry.label || "").trim(),
      scope: normalizeScopeArray(entry.scope),
      pattern: String(entry.pattern || "").trim(),
      action: String(entry.action || "suppress_auto_reply").trim() || "suppress_auto_reply",
    }));
}

function normalizeClassificationReviewRules(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      id: String(entry.id || "").trim(),
      label: String(entry.label || "").trim(),
      scope: normalizeScopeArray(entry.scope),
      pattern: String(entry.pattern || "").trim(),
      action: {
        mode: String(entry.action?.mode || "manual_review").trim() || "manual_review",
        suggestedTemplateId: String(entry.action?.suggestedTemplateId || "").trim(),
      },
    }));
}

function normalizeClassificationOverrides(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      id: String(entry.id || "").trim(),
      label: String(entry.label || "").trim(),
      conditions: Array.isArray(entry.conditions)
        ? entry.conditions
            .filter((condition) => condition && typeof condition === "object")
            .map((condition) => ({
              scope: normalizeScopeArray(condition.scope),
              pattern: String(condition.pattern || "").trim(),
            }))
        : [],
      action: {
        mode: String(entry.action?.mode || "force_template").trim() || "force_template",
        templateId: String(entry.action?.templateId || "").trim(),
      },
    }));
}

function normalizeProductProfiles(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      id: String(entry.id || "").trim(),
      displayNameZh: String(entry.displayNameZh || "").trim(),
      displayNameEn: String(entry.displayNameEn || "").trim(),
      pagePattern: String(entry.pagePattern || "").trim(),
      contentPattern: String(entry.contentPattern || "").trim(),
    }));
}

function normalizeResolutionPolicy(input) {
  const fallback = createEmptyClassificationRules().resolutionPolicy;
  if (!input || typeof input !== "object") {
    return fallback;
  }

  return {
    mode: String(input.mode || fallback.mode).trim() || fallback.mode,
    precedence:
      Array.isArray(input.precedence) && input.precedence.length > 0
        ? input.precedence.map((entry) => String(entry || "").trim()).filter(Boolean)
        : fallback.precedence.slice(),
    multiMatchBehavior:
      String(input.multiMatchBehavior || fallback.multiMatchBehavior).trim() || fallback.multiMatchBehavior,
    familyMatchBehavior:
      String(input.familyMatchBehavior || fallback.familyMatchBehavior).trim() || fallback.familyMatchBehavior,
    noMatchBehavior:
      String(input.noMatchBehavior || fallback.noMatchBehavior).trim() || fallback.noMatchBehavior,
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

function normalizeScopeArray(input) {
  const allowed = new Set(["from", "subject", "body"]);
  const values = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(/[\s,，/|]+/)
      : [];
  return values
    .map((entry) => String(entry || "").trim().toLowerCase())
    .filter((entry) => allowed.has(entry));
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

function mergeClassificationRulesWithStarter(starterRules, cachedRules) {
  const starter = normalizeClassificationRules(starterRules);
  const cached = normalizeClassificationRules(cachedRules);

  if (
    cached.exclusions.length === 0 &&
    cached.overrides.length === 0 &&
    cached.reviewRules.length === 0 &&
    cached.productProfiles.length === 0
  ) {
    return starter;
  }

  return {
    exclusions: cached.exclusions.length > 0 ? cached.exclusions : starter.exclusions,
    overrides: cached.overrides.length > 0 ? cached.overrides : starter.overrides,
    reviewRules: cached.reviewRules.length > 0 ? cached.reviewRules : starter.reviewRules,
    productProfiles: cached.productProfiles.length > 0 ? cached.productProfiles : starter.productProfiles,
    resolutionPolicy: {
      ...starter.resolutionPolicy,
      ...cached.resolutionPolicy,
      precedence:
        Array.isArray(cached.resolutionPolicy?.precedence) && cached.resolutionPolicy.precedence.length > 0
          ? cached.resolutionPolicy.precedence
          : starter.resolutionPolicy.precedence,
    },
  };
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
  appEls.meta.placeholders.textContent =
    group.placeholders.length > 0 ? group.placeholders.map(formatPlaceholderWithAlias).join("，") : "无";
  appEls.meta.note.textContent = group.note || "无";
}

function renderPlaceholderChips() {
  if (!appEls.chipsContainer) return;

  const group = getSelectedGroup();
  const preferredTokens = Array.from(
    new Set([...(state.policySummary.placeholderPolicy.allowed || []), ...((group && group.placeholders) || [])]),
  );

  appEls.chipsContainer.innerHTML = "";
  preferredTokens.forEach((token) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.token = token;
    chip.textContent = getPlaceholderAlias(token);
    chip.title = `${getPlaceholderAlias(token)} ${token}`;
    chip.setAttribute("aria-label", `${getPlaceholderAlias(token)} ${token}`);
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

    const identity = document.createElement("div");
    identity.className = "placeholder-identity";

    const alias = document.createElement("span");
    alias.className = "placeholder-alias";
    alias.textContent = getPlaceholderAlias(item.token);
    identity.appendChild(alias);

    const token = document.createElement("code");
    token.className = "placeholder-token";
    token.textContent = item.token;
    identity.appendChild(token);
    head.appendChild(identity);

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

function renderRuleEngine() {
  if (!appEls.ruleEngineGrid) return;

  const cards = [
    buildRuleEngineCard("exclusions"),
    buildRuleEngineCard("overrides"),
    buildRuleEngineCard("reviewRules"),
    buildRuleEngineCard("productProfiles"),
  ].join("");

  appEls.ruleEngineGrid.innerHTML = cards;
}

function buildRuleEngineCard(section) {
  const meta = RULE_ENGINE_SECTIONS[section];
  const count = getRuleEngineSectionCount(section);
  const items = buildRuleEngineCardItems(section);
  const cardClass =
    section === "overrides" || section === "reviewRules"
      ? "rule-engine-card rule-engine-card--fill"
      : "rule-engine-card";

  return `
    <article class="${cardClass}">
      <div class="rule-engine-card-head">
        <div>
          <p class="rule-engine-title">${escapeHtml(meta.title)}</p>
          <p class="rule-engine-intro">${escapeHtml(meta.intro)}</p>
        </div>
        <button class="btn ghost compact" type="button" data-rule-section="${escapeHtml(section)}">编辑</button>
      </div>
      <p class="rule-engine-meta">${escapeHtml(`${count} 条配置`)}</p>
      ${items}
    </article>`;
}

function buildRuleEngineCardItems(section) {
  if (section === "exclusions") {
    const entries = (state.classificationRules.exclusions || []).map(
      (entry) => `<li><strong>${escapeHtml(entry.label || entry.id || "未命名规则")}</strong><span>${escapeHtml(formatScopeLabel(entry.scope))}</span><code>${escapeHtml(entry.pattern || "")}</code></li>`,
    );
    return `<ul class="rule-engine-list">${entries.join("") || "<li>暂无规则</li>"}</ul>`;
  }

  if (section === "overrides") {
    const entries = (state.classificationRules.overrides || []).map((entry) => {
      const conditions = (entry.conditions || [])
        .map((condition) => `${condition.pattern || ""} @ ${formatScopeLabel(condition.scope)}`)
        .join(" + ");
      return `<li><strong>${escapeHtml(entry.label || entry.id || "未命名规则")}</strong><span>${escapeHtml(entry.action?.templateId || "")}</span><code>${escapeHtml(conditions)}</code></li>`;
    });
    return `<ul class="rule-engine-list">${entries.join("") || "<li>暂无规则</li>"}</ul>`;
  }

  if (section === "reviewRules") {
    const entries = (state.classificationRules.reviewRules || []).map(
      (entry) => `<li><strong>${escapeHtml(entry.label || entry.id || "未命名规则")}</strong><span>${escapeHtml(entry.action?.suggestedTemplateId || "")}</span><code>${escapeHtml(entry.pattern || "")}</code></li>`,
    );
    return `<ul class="rule-engine-list">${entries.join("") || "<li>暂无规则</li>"}</ul>`;
  }

  const products = (state.classificationRules.productProfiles || []).map((entry) => {
    const title = entry.displayNameZh || entry.displayNameEn || entry.id || "未命名产品";
    return `<li><strong>${escapeHtml(title)}</strong><span>${escapeHtml(entry.id || "")}</span><code>${escapeHtml(entry.pagePattern || "")}</code></li>`;
  });
  const policy = state.classificationRules.resolutionPolicy || createEmptyClassificationRules().resolutionPolicy;
  return `
    <div class="rule-engine-policy-pillbox">
      <span class="policy-code-pill"><code class="policy-inline-code">${escapeHtml(policy.mode || "neutral_unless_exact_match")}</code></span>
      <span class="policy-code-pill"><code class="policy-inline-code">${escapeHtml((policy.precedence || []).join(" -> "))}</code></span>
      <span class="policy-code-pill"><code class="policy-inline-code">multi=${escapeHtml(policy.multiMatchBehavior || "neutral")}</code></span>
    </div>
    <ul class="rule-engine-list">${products.join("") || "<li>暂无 profile</li>"}</ul>`;
}

function getRuleEngineSectionCount(section) {
  if (section === "exclusions") return state.classificationRules.exclusions.length;
  if (section === "overrides") return state.classificationRules.overrides.length;
  if (section === "reviewRules") return state.classificationRules.reviewRules.length;
  if (section === "productProfiles") return state.classificationRules.productProfiles.length;
  return 0;
}

function onRuleEngineGridClick(event) {
  const button = event.target.closest("[data-rule-section]");
  if (!button) return;
  openRuleEditor(button.dataset.ruleSection || "");
}

function openRuleEditor(section) {
  if (!RULE_ENGINE_SECTIONS[section]) return;

  state.ruleEditorSection = section;
  if (appEls.ruleEngineTitle) {
    appEls.ruleEngineTitle.textContent = RULE_ENGINE_SECTIONS[section].title;
  }
  if (appEls.ruleEngineIntro) {
    appEls.ruleEngineIntro.textContent = RULE_ENGINE_SECTIONS[section].intro;
  }
  setStatus(appEls.ruleEngineStatus, "", false);
  renderRuleEditorBody(section, cloneRuleEditorSection(section));
  appEls.ruleEngineModal?.classList.remove("hidden");
  appEls.ruleEngineModal?.setAttribute("aria-hidden", "false");
  appEls.ruleEngineEditorBody?.querySelector("input, textarea")?.focus();
}

function closeRuleEditor(restoreFocus = true) {
  const section = state.ruleEditorSection;
  state.ruleEditorSection = null;
  appEls.ruleEngineModal?.classList.add("hidden");
  appEls.ruleEngineModal?.setAttribute("aria-hidden", "true");
  setStatus(appEls.ruleEngineStatus, "", false);
  if (restoreFocus && section) {
    appEls.ruleEngineGrid?.querySelector(`[data-rule-section="${section}"]`)?.focus();
  }
}

function cloneRuleEditorSection(section) {
  const source =
    section === "exclusions"
      ? state.classificationRules.exclusions
      : section === "overrides"
        ? state.classificationRules.overrides
        : section === "reviewRules"
          ? state.classificationRules.reviewRules
          : state.classificationRules.productProfiles;
  return JSON.parse(JSON.stringify(source || []));
}

function renderRuleEditorBody(section, draft) {
  if (!appEls.ruleEngineEditorBody) return;

  if (section === "exclusions") {
    appEls.ruleEngineEditorBody.innerHTML = renderExclusionEditor(draft);
    return;
  }
  if (section === "overrides") {
    appEls.ruleEngineEditorBody.innerHTML = renderOverrideEditor(draft);
    return;
  }
  if (section === "reviewRules") {
    appEls.ruleEngineEditorBody.innerHTML = renderReviewEditor(draft);
    return;
  }
  if (section === "productProfiles") {
    appEls.ruleEngineEditorBody.innerHTML = renderProductProfileEditor(draft);
  }
}

function renderExclusionEditor(entries) {
  const content = (entries || [])
    .map(
      (entry, index) => `
        <section class="rule-editor-entry" data-index="${index}">
          <div class="rule-editor-entry-head">
            <p class="rule-editor-entry-title">排除规则 ${index + 1}</p>
            <button class="btn danger compact" type="button" data-action="remove-item" data-index="${index}">删除</button>
          </div>
          <div class="inline-grid">
            <label>规则 ID<input type="text" data-field="id" value="${escapeHtml(entry.id || "")}" /></label>
            <label>名称<input type="text" data-field="label" value="${escapeHtml(entry.label || "")}" /></label>
          </div>
          ${buildScopeEditorHtml(entry.scope)}
          <label>正则<textarea class="regex-text" rows="3" data-field="pattern">${escapeHtml(entry.pattern || "")}</textarea></label>
          <p class="rule-editor-note">动作固定为：抑制自动回复</p>
        </section>`,
    )
    .join("");

  return `${content}<button class="btn ghost" type="button" data-action="add-item">新增排除规则</button>`;
}

function renderReviewEditor(entries) {
  const content = (entries || [])
    .map(
      (entry, index) => `
        <section class="rule-editor-entry" data-index="${index}">
          <div class="rule-editor-entry-head">
            <p class="rule-editor-entry-title">人工复核规则 ${index + 1}</p>
            <button class="btn danger compact" type="button" data-action="remove-item" data-index="${index}">删除</button>
          </div>
          <div class="inline-grid">
            <label>规则 ID<input type="text" data-field="id" value="${escapeHtml(entry.id || "")}" /></label>
            <label>名称<input type="text" data-field="label" value="${escapeHtml(entry.label || "")}" /></label>
          </div>
          ${buildScopeEditorHtml(entry.scope)}
          <label>正则<textarea class="regex-text" rows="3" data-field="pattern">${escapeHtml(entry.pattern || "")}</textarea></label>
          <label>建议模板 ID<input type="text" data-field="suggestedTemplateId" value="${escapeHtml(entry.action?.suggestedTemplateId || "")}" /></label>
          <p class="rule-editor-note">动作固定为：人工复核</p>
        </section>`,
    )
    .join("");

  return `${content}<button class="btn ghost" type="button" data-action="add-item">新增人工复核规则</button>`;
}

function renderOverrideEditor(entries) {
  const content = (entries || [])
    .map(
      (entry, index) => `
        <section class="rule-editor-entry" data-index="${index}">
          <div class="rule-editor-entry-head">
            <p class="rule-editor-entry-title">覆盖规则 ${index + 1}</p>
            <button class="btn danger compact" type="button" data-action="remove-item" data-index="${index}">删除</button>
          </div>
          <div class="inline-grid">
            <label>规则 ID<input type="text" data-field="id" value="${escapeHtml(entry.id || "")}" /></label>
            <label>名称<input type="text" data-field="label" value="${escapeHtml(entry.label || "")}" /></label>
          </div>
          <label>强制切换到的模板 ID<input type="text" data-field="templateId" value="${escapeHtml(entry.action?.templateId || "")}" /></label>
          <div class="rule-condition-list">
            ${(entry.conditions || [])
              .map(
                (condition, conditionIndex) => `
                  <section class="rule-condition-entry" data-condition-index="${conditionIndex}">
                    <div class="rule-editor-entry-head">
                      <p class="rule-editor-entry-subtitle">条件 ${conditionIndex + 1}</p>
                      <button class="btn danger compact" type="button" data-action="remove-condition" data-index="${index}" data-condition-index="${conditionIndex}">删除条件</button>
                    </div>
                    ${buildScopeEditorHtml(condition.scope, "condition")}
                    <label>正则<textarea class="regex-text" rows="3" data-field="conditionPattern">${escapeHtml(condition.pattern || "")}</textarea></label>
                  </section>`,
              )
              .join("")}
          </div>
          <button class="btn ghost compact" type="button" data-action="add-condition" data-index="${index}">新增条件</button>
        </section>`,
    )
    .join("");

  return `${content}<button class="btn ghost" type="button" data-action="add-item">新增覆盖规则</button>`;
}

function renderProductProfileEditor(entries) {
  const policy = state.classificationRules.resolutionPolicy || createEmptyClassificationRules().resolutionPolicy;
  const content = (entries || [])
    .map(
      (entry, index) => `
        <section class="rule-editor-entry" data-index="${index}">
          <div class="rule-editor-entry-head">
            <p class="rule-editor-entry-title">产品 profile ${index + 1}</p>
            <button class="btn danger compact" type="button" data-action="remove-item" data-index="${index}">删除</button>
          </div>
          <div class="inline-grid">
            <label>Profile ID<input type="text" data-field="id" value="${escapeHtml(entry.id || "")}" /></label>
            <label>中文名<input type="text" data-field="displayNameZh" value="${escapeHtml(entry.displayNameZh || "")}" /></label>
          </div>
          <label>英文名<input type="text" data-field="displayNameEn" value="${escapeHtml(entry.displayNameEn || "")}" /></label>
          <label>页面 slug / pagePattern<textarea class="regex-text" rows="2" data-field="pagePattern">${escapeHtml(entry.pagePattern || "")}</textarea></label>
          <label>正文 / 主题信号 contentPattern<textarea class="regex-text" rows="2" data-field="contentPattern">${escapeHtml(entry.contentPattern || "")}</textarea></label>
        </section>`,
    )
    .join("");

  return `
    <section class="rule-editor-entry rule-editor-entry-static">
      <p class="rule-editor-entry-title">当前解析策略</p>
      <div class="rule-engine-policy-pillbox">
        <span class="policy-code-pill"><code class="policy-inline-code">${escapeHtml(policy.mode || "neutral_unless_exact_match")}</code></span>
        <span class="policy-code-pill"><code class="policy-inline-code">${escapeHtml((policy.precedence || []).join(" -> "))}</code></span>
        <span class="policy-code-pill"><code class="policy-inline-code">multi=${escapeHtml(policy.multiMatchBehavior || "neutral")}</code></span>
        <span class="policy-code-pill"><code class="policy-inline-code">family=${escapeHtml(policy.familyMatchBehavior || "neutral")}</code></span>
      </div>
      <p class="rule-editor-note">当前版本不在页面里自动按 profile 改正文；这里只维护后续可消费的结构化识别信号。</p>
    </section>
    ${content}
    <button class="btn ghost" type="button" data-action="add-item">新增产品 profile</button>`;
}

function buildScopeEditorHtml(selected, field = "scope") {
  const values = new Set(normalizeScopeArray(selected));
  const options = [
    { key: "from", label: "From" },
    { key: "subject", label: "Subject" },
    { key: "body", label: "Body" },
  ];

  return `
    <div class="rule-scope-editor" data-field-group="${field}">
      <span class="rule-scope-label">作用域</span>
      <div class="rule-scope-options">
        ${options
          .map(
            (option) => `
              <label class="rule-scope-option">
                <input type="checkbox" data-field="${field}" value="${option.key}" ${values.has(option.key) ? "checked" : ""} />
                <span>${option.label}</span>
              </label>`,
          )
          .join("")}
      </div>
    </div>`;
}

function onRuleEngineEditorClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button || !state.ruleEditorSection) return;

  const section = state.ruleEditorSection;
  const draft = collectRuleEditorEntries(section);
  const action = button.dataset.action;

  if (action === "add-item") {
    draft.push(createEmptyRuleEntry(section));
    renderRuleEditorBody(section, draft);
    return;
  }

  const index = Number(button.dataset.index);
  if (!Number.isInteger(index) || index < 0) return;

  if (action === "remove-item") {
    draft.splice(index, 1);
    renderRuleEditorBody(section, draft);
    return;
  }

  if (action === "add-condition" && section === "overrides") {
    draft[index]?.conditions?.push(createEmptyOverrideCondition());
    renderRuleEditorBody(section, draft);
    return;
  }

  if (action === "remove-condition" && section === "overrides") {
    const conditionIndex = Number(button.dataset.conditionIndex);
    if (!Number.isInteger(conditionIndex) || conditionIndex < 0) return;
    draft[index]?.conditions?.splice(conditionIndex, 1);
    renderRuleEditorBody(section, draft);
  }
}

function createEmptyRuleEntry(section) {
  if (section === "exclusions") {
    return { id: "", label: "", scope: ["subject"], pattern: "", action: "suppress_auto_reply" };
  }
  if (section === "reviewRules") {
    return {
      id: "",
      label: "",
      scope: ["subject"],
      pattern: "",
      action: { mode: "manual_review", suggestedTemplateId: "" },
    };
  }
  if (section === "overrides") {
    return {
      id: "",
      label: "",
      conditions: [createEmptyOverrideCondition()],
      action: { mode: "force_template", templateId: "" },
    };
  }
  return {
    id: "",
    displayNameZh: "",
    displayNameEn: "",
    pagePattern: "",
    contentPattern: "",
  };
}

function createEmptyOverrideCondition() {
  return {
    scope: ["subject"],
    pattern: "",
  };
}

function collectRuleEditorEntries(section) {
  const entries = Array.from(appEls.ruleEngineEditorBody?.querySelectorAll(".rule-editor-entry[data-index]") || []);

  if (section === "exclusions") {
    return entries.map((entry) => ({
      id: readRuleEditorValue(entry, "id"),
      label: readRuleEditorValue(entry, "label"),
      scope: readRuleScopeValues(entry, "scope"),
      pattern: readRuleEditorValue(entry, "pattern"),
      action: "suppress_auto_reply",
    }));
  }

  if (section === "reviewRules") {
    return entries.map((entry) => ({
      id: readRuleEditorValue(entry, "id"),
      label: readRuleEditorValue(entry, "label"),
      scope: readRuleScopeValues(entry, "scope"),
      pattern: readRuleEditorValue(entry, "pattern"),
      action: {
        mode: "manual_review",
        suggestedTemplateId: readRuleEditorValue(entry, "suggestedTemplateId"),
      },
    }));
  }

  if (section === "overrides") {
    return entries.map((entry) => ({
      id: readRuleEditorValue(entry, "id"),
      label: readRuleEditorValue(entry, "label"),
      conditions: Array.from(entry.querySelectorAll(".rule-condition-entry")).map((condition) => ({
        scope: readRuleScopeValues(condition, "condition"),
        pattern: readRuleEditorValue(condition, "conditionPattern"),
      })),
      action: {
        mode: "force_template",
        templateId: readRuleEditorValue(entry, "templateId"),
      },
    }));
  }

  return entries.map((entry) => ({
    id: readRuleEditorValue(entry, "id"),
    displayNameZh: readRuleEditorValue(entry, "displayNameZh"),
    displayNameEn: readRuleEditorValue(entry, "displayNameEn"),
    pagePattern: readRuleEditorValue(entry, "pagePattern"),
    contentPattern: readRuleEditorValue(entry, "contentPattern"),
  }));
}

function readRuleEditorValue(container, field) {
  return String(container.querySelector(`[data-field="${field}"]`)?.value || "").trim();
}

function readRuleScopeValues(container, field) {
  return normalizeScopeArray(
    Array.from(container.querySelectorAll(`input[data-field="${field}"]:checked`)).map((input) => input.value),
  );
}

function saveRuleEditor() {
  const section = state.ruleEditorSection;
  if (!section) return;

  const entries = collectRuleEditorEntries(section);
  const validation = validateRuleEngineSection(section, entries);
  if (validation.length > 0) {
    setStatus(appEls.ruleEngineStatus, validation.join("；"), true);
    return;
  }

  state.classificationRules[section] = entries;
  persistLocalGroups();
  renderRuleEngine();
  renderPolicySummary();
  closeRuleEditor();
  setStatus(appEls.status, "已更新 Rule Engine 配置。", false);
}

function validateRuleEngineSection(section, entries) {
  const errors = [];
  const ids = new Set();

  entries.forEach((entry, index) => {
    const label = `${RULE_ENGINE_SECTIONS[section]?.title || section} 第 ${index + 1} 条`;

    if (!entry.id) {
      errors.push(`${label} 缺少 ID`);
    } else if (ids.has(entry.id)) {
      errors.push(`${label} 的 ID 重复`);
    } else {
      ids.add(entry.id);
    }

    if (section === "exclusions" || section === "reviewRules") {
      if (entry.scope.length === 0) {
        errors.push(`${label} 至少选择一个作用域`);
      }
      if (!entry.pattern || !isValidRegexText(entry.pattern)) {
        errors.push(`${label} 的正则格式无效`);
      }
      if (section === "reviewRules" && !entry.action?.suggestedTemplateId) {
        errors.push(`${label} 缺少建议模板 ID`);
      }
    }

    if (section === "overrides") {
      if (!entry.action?.templateId) {
        errors.push(`${label} 缺少目标模板 ID`);
      }
      if (!Array.isArray(entry.conditions) || entry.conditions.length === 0) {
        errors.push(`${label} 至少保留一个条件`);
      }
      (entry.conditions || []).forEach((condition, conditionIndex) => {
        if (condition.scope.length === 0) {
          errors.push(`${label} 的条件 ${conditionIndex + 1} 至少选择一个作用域`);
        }
        if (!condition.pattern || !isValidRegexText(condition.pattern)) {
          errors.push(`${label} 的条件 ${conditionIndex + 1} 正则格式无效`);
        }
      });
    }

    if (section === "productProfiles") {
      if (!entry.displayNameZh && !entry.displayNameEn) {
        errors.push(`${label} 至少填写一个展示名称`);
      }
      if (!entry.pagePattern && !entry.contentPattern) {
        errors.push(`${label} 至少填写 pagePattern 或 contentPattern`);
      }
      if (entry.pagePattern && !isValidRegexText(entry.pagePattern)) {
        errors.push(`${label} 的 pagePattern 格式无效`);
      }
      if (entry.contentPattern && !isValidRegexText(entry.contentPattern)) {
        errors.push(`${label} 的 contentPattern 格式无效`);
      }
    }
  });

  return errors;
}

function formatScopeLabel(scope) {
  const labels = {
    from: "From",
    subject: "Subject",
    body: "Body",
  };
  const normalized = normalizeScopeArray(scope);
  return normalized.length > 0 ? normalized.map((item) => labels[item] || item).join(" / ") : "未指定";
}

function renderPolicySummary() {
  if (!appEls.policySummaryContent) return;

  const policy = state.policySummary;
  const sections = [
    buildPluginActivationPolicySection(policy.pluginActivationGuide),
    buildKeywordRegexPolicySection(policy.keywordRegexGuide),
    buildRuleEnginePolicySection(state.classificationRules),
    buildRichPolicySection("来源与主题策略", {
      className: "policy-section-source",
      groups: [
        { title: "来源文件", items: policy.sourceFiles.map((item) => `\`${item}\``), meta: `${policy.sourceFiles.length} 份` },
        {
          title: "语言策略",
          items: [
            policy.defaultLanguage ? `默认语言：\`${policy.defaultLanguage}\`` : "",
            ...policy.localizeWhen.map((item) => `切换语言条件：${item}`),
          ],
          className: "policy-group-wide",
        },
        {
          title: "主题策略",
          items: [policy.subjectStrategy.source, policy.subjectStrategy.editorFallback],
          meta: "线程优先",
        },
      ],
    }),
    buildPlaceholderPolicySection(policy.placeholderPolicy),
    buildRichPolicySection("去重与排除", {
      className: "policy-section-dedupe",
      groups: [
        { title: "去重规则", items: policy.dedupeRules, meta: `${policy.dedupeRules.length} 条` },
        {
          title: "排除规则",
          items: policy.exclusionRules.map((rule) =>
            [rule.id ? `\`${rule.id}\`` : "", rule.reason, rule.routeTo ? `路由：\`${rule.routeTo}\`` : ""]
              .filter(Boolean)
              .join(" | "),
          ),
          meta: `${policy.exclusionRules.length} 条`,
          className: "policy-group-wide",
        },
      ],
    }),
    buildRoutingTeamsPolicySection(policy.routingGroups),
    buildManualFlowPolicySection(policy.manualFlowNorms),
  ]
    .filter(Boolean)
    .join("");

  appEls.policySummaryContent.innerHTML = sections;
}

function buildRichPolicySection(title, config = {}) {
  const groups = (config.groups || [])
    .map((group) => ({
      ...group,
      items: (group.items || []).filter(Boolean),
    }))
    .filter((group) => group.items.length > 0);

  if (!config.intro && groups.length === 0) {
    return "";
  }

  const groupHtml = groups.map(buildPolicyGroupCard).join("");
  const overview = config.intro ? `<p class="policy-intro">${formatPolicyText(config.intro)}</p>` : "";
  const sectionClass = config.className ? ` ${escapeHtml(config.className)}` : "";

  return `
    <details class="policy-section policy-section-rich${sectionClass}" open>
      <summary>${escapeHtml(title)}</summary>
      ${overview}
      ${groupHtml ? `<div class="policy-group-grid">${groupHtml}</div>` : ""}
    </details>`;
}

function buildPlaceholderPolicySection(policy) {
  const allowed = (policy.allowed || []).filter(Boolean);
  const banned = (policy.banned || []).filter(Boolean);
  const implementationNotes = (policy.implementationNotes || []).filter(Boolean);

  if (!policy.principle && !policy.namingRule && allowed.length === 0 && banned.length === 0 && implementationNotes.length === 0) {
    return "";
  }

  const allowedHtml = allowed
    .map(
      (token) => `
        <span class="policy-token-chip">
          <span class="policy-token-chip-label">${escapeHtml(getPlaceholderAlias(token))}</span>
          <code class="policy-inline-code">${escapeHtml(token)}</code>
        </span>`,
    )
    .join("");

  const bannedHtml = banned
    .map(
      (token) => `
        <span class="policy-code-pill">
          <code class="policy-inline-code">${escapeHtml(token)}</code>
        </span>`,
    )
    .join("");

  const notesHtml = implementationNotes
    .map(
      (item) => `
        <li class="policy-group-item">
          <span class="policy-group-bullet" aria-hidden="true"></span>
          <span class="policy-step-text">${formatPolicyText(item)}</span>
        </li>`,
    )
    .join("");

  return `
    <details class="policy-section policy-section-rich policy-section-placeholder" open>
      <summary>${escapeHtml("占位符政策")}</summary>
      ${policy.principle ? `<p class="policy-intro">${formatPolicyText(policy.principle)}</p>` : ""}
      <div class="policy-placeholder-layout">
        ${
          allowed.length > 0
            ? `
              <section class="policy-group policy-placeholder-allowed">
                <div class="policy-group-head">
                  <p class="policy-group-title">允许占位符</p>
                  <span class="policy-group-meta">${allowed.length} 个</span>
                </div>
                <div class="policy-chip-cloud">${allowedHtml}</div>
              </section>`
            : ""
        }
        ${
          policy.namingRule
            ? `
              <section class="policy-group policy-placeholder-naming">
                <p class="policy-group-title">命名规则</p>
                <p class="policy-group-text">${formatPolicyText(policy.namingRule)}</p>
              </section>`
            : ""
        }
        ${
          implementationNotes.length > 0
            ? `
              <section class="policy-group policy-placeholder-implementation">
                <p class="policy-group-title">实现说明</p>
                <ul class="policy-group-list">${notesHtml}</ul>
              </section>`
            : ""
        }
        ${
          banned.length > 0
            ? `
              <section class="policy-group policy-placeholder-banned">
                <div class="policy-group-head">
                  <p class="policy-group-title">禁用占位符</p>
                  <span class="policy-group-meta">${banned.length} 个</span>
                </div>
                <div class="policy-code-cloud">${bannedHtml}</div>
              </section>`
            : ""
        }
      </div>
    </details>`;
}

function buildPluginActivationPolicySection(guide) {
  return buildRichPolicySection("有插件激活", {
    className: "policy-section-activation-clean",
    intro: guide.overview,
    groups: [
      { title: "安装准备", items: guide.installSteps, ordered: true },
      { title: "使用流程", items: guide.usageSteps, ordered: true },
      { title: "验收检查", items: guide.successChecks, ordered: true },
      { title: "常见排查", items: guide.troubleshooting, ordered: true },
    ],
  });
}

function buildKeywordRegexPolicySection(guide) {
  return buildRichPolicySection("关键词/正则", {
    className: "policy-section-keywords-clean",
    intro: guide.purpose,
    groups: [
      { title: "标准格式", items: [guide.syntax] },
      { title: "Flags", items: guide.flags },
      { title: "编写原则", items: guide.authoringRules, className: "policy-group-wide" },
      { title: "示例", items: guide.examples.map((item) => `\`${item}\``), className: "policy-group-wide" },
    ],
  });
}

function buildRuleEnginePolicySection(rules) {
  const exclusions = (rules?.exclusions || []).map(
    (entry) =>
      `${entry.label || entry.id || "未命名规则"}：\`${entry.pattern || ""}\` | 作用域：${formatScopeLabel(entry.scope)}`,
  );
  const overrides = (rules?.overrides || []).map((entry) => {
    const conditions = (entry.conditions || [])
      .map((condition) => `\`${condition.pattern || ""}\` @ ${formatScopeLabel(condition.scope)}`)
      .join(" + ");
    return `${entry.label || entry.id || "未命名规则"}：${conditions} -> \`${entry.action?.templateId || ""}\``;
  });
  const reviews = (rules?.reviewRules || []).map(
    (entry) =>
      `${entry.label || entry.id || "未命名规则"}：\`${entry.pattern || ""}\` @ ${formatScopeLabel(entry.scope)} -> \`${entry.action?.suggestedTemplateId || ""}\``,
  );
  const products = (rules?.productProfiles || []).map((entry) => {
    const name = entry.displayNameZh || entry.displayNameEn || entry.id || "未命名产品";
    const signals = [entry.pagePattern ? `页：\`${entry.pagePattern}\`` : "", entry.contentPattern ? `文：\`${entry.contentPattern}\`` : ""]
      .filter(Boolean)
      .join(" | ");
    return `${name}${signals ? `：${signals}` : ""}`;
  });
  const policyItems = [
    rules?.resolutionPolicy?.mode ? `解析策略：\`${rules.resolutionPolicy.mode}\`` : "",
    Array.isArray(rules?.resolutionPolicy?.precedence) && rules.resolutionPolicy.precedence.length > 0
      ? `优先级：\`${rules.resolutionPolicy.precedence.join(" -> ")}\``
      : "",
    rules?.resolutionPolicy?.multiMatchBehavior ? `多命中：\`${rules.resolutionPolicy.multiMatchBehavior}\`` : "",
    rules?.resolutionPolicy?.noMatchBehavior ? `无命中：\`${rules.resolutionPolicy.noMatchBehavior}\`` : "",
  ].filter(Boolean);

  return buildRichPolicySection("规则引擎", {
    className: "policy-section-rule-engine",
    intro: "模板关键词只负责描述模板线索；真正的全局排除、覆盖、人工复核和产品识别信号统一维护在 Rule Engine 中。",
    groups: [
      { title: "全局排除", items: exclusions, meta: `${exclusions.length} 条` },
      { title: "覆盖规则", items: overrides, meta: `${overrides.length} 条` },
      { title: "人工复核", items: reviews, meta: `${reviews.length} 条` },
      { title: "产品识别", items: [...policyItems, ...products], meta: `${products.length} 个 profile`, className: "policy-group-wide" },
    ],
  });
}

function buildRoutingTeamsPolicySection(routingGroups) {
  const groups = (routingGroups || [])
    .map((group) => ({
      ...group,
      handles: (group.handles || []).filter(Boolean),
    }))
    .filter((group) => group.label || group.mailbox || group.handles.length > 0);

  if (groups.length === 0) {
    return "";
  }

  const cards = groups
    .map(
      (group) => `
        <section class="policy-group policy-routing-card">
          <div class="policy-group-head">
            <p class="policy-group-title">${escapeHtml(group.label || "")}</p>
            ${group.mailbox ? `<span class="policy-code-pill"><code class="policy-inline-code">${escapeHtml(group.mailbox)}</code></span>` : ""}
          </div>
          <ul class="policy-group-list">
            ${group.handles
              .map(
                (item) => `
                  <li class="policy-group-item">
                    <span class="policy-group-bullet" aria-hidden="true"></span>
                    <span class="policy-step-text">${formatPolicyText(item)}</span>
                  </li>`,
              )
              .join("")}
          </ul>
        </section>`,
    )
    .join("");

  return `
    <details class="policy-section policy-section-rich policy-section-routing-clean" open>
      <summary>${escapeHtml("路由团队")}</summary>
      <div class="policy-routing-grid">${cards}</div>
    </details>`;
}

function buildManualFlowPolicySection(norms) {
  const controlItems = [
    ...(norms.signatureControl || []).map((item) => `签名控制：${item}`),
    ...(norms.pricingControl || []).map((item) => `价格控制：${item}`),
  ];

  return buildRichPolicySection("人工跟进规范", {
    className: "policy-section-manual-clean",
    groups: [
      { title: "第一封自动回复", items: norms.firstTouch || [], className: "policy-group-wide" },
      { title: "人工二次触达", items: norms.secondTouch || [] },
      { title: "升级与转交", items: norms.escalation || [] },
      { title: "控制要求", items: controlItems, className: "policy-group-wide" },
    ],
  });
}

function buildPolicyGroupCard(group) {
  const listClass = group.ordered ? "policy-step-list" : "policy-group-list";
  const listTag = group.ordered ? "ol" : "ul";
  const cardClass = group.className ? ` ${escapeHtml(group.className)}` : "";
  const itemsHtml = group.items
    .map((item) =>
      group.ordered
        ? `
            <li class="policy-step-item">
              <span class="policy-step-index" aria-hidden="true"></span>
              <span class="policy-step-text">${formatPolicyText(item)}</span>
            </li>`
        : `
            <li class="policy-group-item">
              <span class="policy-group-bullet" aria-hidden="true"></span>
              <span class="policy-step-text">${formatPolicyText(item)}</span>
            </li>`,
    )
    .join("");

  return `
    <section class="policy-group${cardClass}">
      <div class="policy-group-head">
        <p class="policy-group-title">${escapeHtml(group.title || "")}</p>
        ${group.meta ? `<span class="policy-group-meta">${escapeHtml(group.meta)}</span>` : ""}
      </div>
      <${listTag} class="${listClass}">
        ${itemsHtml}
      </${listTag}>
    </section>`;
}

function formatPolicyText(text) {
  return escapeHtml(String(text || "")).replace(/`([^`]+)`/g, '<code class="policy-inline-code">$1</code>');
}

function hasPolicySummary(policySummary) {
  return Boolean(
    policySummary?.title ||
      policySummary?.pluginActivationGuide?.overview ||
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
      classificationRules: state.classificationRules,
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
    if (Number(payload?.version) < TEMPLATE_DATA_VERSION) {
      return {
        groups: [],
        policySummary: createEmptyPolicySummary(),
        classificationRules: createEmptyClassificationRules(),
      };
    }
    return {
      groups: parseTemplateGroupsPayload(payload),
      policySummary: normalizePolicySummary(payload?.policySummary),
      classificationRules: normalizeClassificationRules(payload?.classificationRules),
    };
  } catch (_error) {
    return {
      groups: [],
      policySummary: createEmptyPolicySummary(),
      classificationRules: createEmptyClassificationRules(),
    };
  }
}

function mergePolicySummaryWithStarter(starterPolicy, cachedPolicy) {
  const starter = normalizePolicySummary(starterPolicy);
  if (!hasPolicySummary(cachedPolicy)) {
    return starter;
  }

  const cached = normalizePolicySummary(cachedPolicy);
  return {
    ...starter,
    defaultBlocks: mergeDefaultBlocksWithStarter(starter.defaultBlocks, cached.defaultBlocks),
  };
}

function mergeDefaultBlocksWithStarter(starterBlocks, cachedBlocks) {
  const starterMap = new Map(
    normalizePolicyDefaults(starterBlocks).map((entry) => [entry.token, { ...entry }]),
  );
  const cachedMap = new Map(
    normalizePolicyDefaults(cachedBlocks).map((entry) => [entry.token, { ...entry }]),
  );
  const merged = [];
  const seen = new Set();

  starterMap.forEach((starterEntry, token) => {
    const cachedEntry = cachedMap.get(token);
    merged.push({
      token,
      value: shouldUseStarterDefault(token, cachedEntry?.value) ? starterEntry.value : cachedEntry.value,
    });
    seen.add(token);
  });

  cachedMap.forEach((entry, token) => {
    if (seen.has(token)) return;
    merged.push(entry);
  });

  return merged;
}

function shouldUseStarterDefault(token, cachedValue) {
  const normalized = String(cachedValue || "").trim();
  if (!normalized) {
    return true;
  }

  return (LEGACY_DEFAULT_BLOCK_VALUES[token] || []).includes(normalized);
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
  renderManualGuide(state.activationPrefs.targetMailbox, state.activationPrefs.mode, []);
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
    classificationRules: state.classificationRules,
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

function exportClassificationRuleDraft() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    source: "katvr-autoreply-studio",
    resolutionPolicy: state.classificationRules.resolutionPolicy,
    classificationRules: state.classificationRules,
    templates: state.groups.map((group) => ({
      templateId: group.groupId,
      category: group.category,
      priority: group.priority,
      matchFields: group.matchFields,
      keywords: group.keywords,
      routing: group.routing,
      sla: group.sla,
      exclusions: group.exclusions,
      placeholders: group.placeholders,
      note: group.note,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `classification-rule-draft-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus(appEls.status, "已导出分类规则草案。", false);
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
    state.classificationRules = mergeClassificationRulesWithStarter(
      state.classificationRules,
      parsed.classificationRules,
    );
    state.selectedGroupId = parsed.groups[0].groupId;
    state.selectedLocale = "zh-CN";
    persistLocalGroups();
    renderRuleEngine();
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
    setStatus(appEls.status, "请先点击激活按钮，再复制当前主题。", true);
    return;
  }
  await copyToClipboard(subject, "已复制当前主题。", "复制失败，请检查浏览器权限。");
}

async function copyManualBody() {
  const body = String(state.activationGuide?.bodyText || "").trim();
  if (!body) {
    setStatus(appEls.status, "请先点击激活按钮，再复制当前正文。", true);
    return;
  }
  await copyToClipboard(body, "已复制当前正文。", "复制失败，请检查浏览器权限。");
}

async function copyManualPacket() {
  const packetText = String(state.activationGuide?.packetText || "").trim();
  if (!packetText) {
    setStatus(appEls.status, "请先点击激活按钮，再复制完整激活包。", true);
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

  const targetUrl = buildAliMailActivationUrl(envelope);
  const opened = window.open(targetUrl, "_blank", "noopener,noreferrer");

  if (!opened) {
    const useCurrentTab = window.confirm(
      "浏览器拦截了新窗口。是否在当前页打开 AliMail 并继续激活？（当前页内容已自动保存）",
    );
    if (useCurrentTab) {
      window.location.assign(targetUrl);
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
  const nextStepMessage =
    "AliMail 页面会优先尝试插件自动填写；如果没有出现“AliMail 激活器”提示，请使用下方无插件教程，或直接复制其中的 AliMail 网址自行访问。";

  setStatus(appEls.status, `${modeMessage}${copyMessage} ${nextStepMessage}${warningMessage}`, false);
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

  const unresolvedPlaceholders = Array.from(new Set(`${subject}\n${body}`.match(/\{\{[^}]+\}\}/g) || []));
  if (unresolvedPlaceholders.length > 0) {
    warnings.push(
      `检测到未填写占位符 ${unresolvedPlaceholders.join("、")}；AliMail 不会自动替换，请先在“占位符实际信息”中填写，或直接把正文改成实际内容`,
    );
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

function buildAliMailActivationUrl(envelope) {
  const payload = encodeActivationEnvelope(envelope);
  return `${ALIMAIL_WEBMAIL_URL}#alimailActivate=${payload}`;
}

function encodeActivationEnvelope(envelope) {
  const json = JSON.stringify(envelope);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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

  const mailboxLabel = String(targetMailbox || "").trim() || "（请先填写上方指定邮箱）";
  const steps = [
    `确认当前登录邮箱为 ${mailboxLabel}。`,
    `AliMail 网址：${ALIMAIL_WEBMAIL_URL}`,
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

function getPlaceholderAlias(token) {
  const normalized = String(token || "").trim();
  return PLACEHOLDER_ALIASES[normalized] || normalized.replace(/[{}]/g, "") || normalized;
}

function formatPlaceholderWithAlias(token) {
  const normalized = String(token || "").trim();
  if (!normalized) return "";
  return `${getPlaceholderAlias(normalized)}（${normalized}）`;
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
