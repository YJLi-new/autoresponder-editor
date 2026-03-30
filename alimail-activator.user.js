// ==UserScript==
// @name         KATVR AliMail Auto Reply Activator
// @namespace    https://yjli-new.github.io/autoresponder-editor/
// @version      1.1.7
// @description  Read activation payload from URL and apply auto-reply settings in AliMail enterprise web.
// @match        https://qiye.aliyun.com/*
// @match        https://mail.aliyun.com/*
// @match        https://mail.qiye.aliyun.com/*
// @include      https://mail.qiye.aliyun.com:8443/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const WINDOW_NAME_PREFIX = "katvrAlimailActivate:";
  const activation = readActivationParam();
  if (!activation.encoded) {
    showIdleNotice();
    return;
  }

  const rawPayload = parsePayload(activation.encoded);
  const envelope = normalizeEnvelope(rawPayload);
  if (!envelope) {
    showNotice("AliMail 激活器：参数解析失败", true);
    return;
  }

  removeActivationParam();
  run(envelope).catch((error) => {
    console.error("[AliMail Activator] failed:", error);
    showNotice(`AliMail 激活失败：${error.message}`, true);
  });

  function readActivationParam() {
    const fromWindowName = readActivationFromWindowName();
    if (fromWindowName) {
      return {
        encoded: fromWindowName,
        source: "window.name",
      };
    }

    const hash = String(window.location.hash || "").replace(/^#/, "");
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const fromHash = hashParams.get("alimailActivate");
      if (fromHash) {
        return {
          encoded: fromHash,
          source: "hash",
        };
      }
    }

    const search = new URLSearchParams(window.location.search);
    return {
      encoded: search.get("alimailActivate") || "",
      source: "query",
    };
  }

  function readActivationFromWindowName() {
    const value = String(window.name || "");
    if (!value.startsWith(WINDOW_NAME_PREFIX)) {
      return "";
    }

    return value.slice(WINDOW_NAME_PREFIX.length).trim();
  }

  function parsePayload(base64UrlText) {
    try {
      const base64 = base64UrlText.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const text = new TextDecoder().decode(bytes);
      return JSON.parse(text);
    } catch (_error) {
      return null;
    }
  }

  function normalizeEnvelope(payload) {
    if (!payload || typeof payload !== "object") return null;

    if (payload.version === 2 && payload.activeTemplate) {
      return {
        version: 2,
        mode: payload.mode === "all" ? "all" : "current",
        targetMailbox: String(payload.targetMailbox || "").trim(),
        activeTemplate: payload.activeTemplate,
        templates: Array.isArray(payload.templates) ? payload.templates : [payload.activeTemplate],
      };
    }

    if (typeof payload.subject === "string") {
      return {
        version: 2,
        mode: "current",
        targetMailbox: "",
        activeTemplate: payload,
        templates: [payload],
      };
    }

    return null;
  }

  function removeActivationParam() {
    const url = new URL(window.location.href);
    url.searchParams.delete("alimailActivate");
    const hashParams = new URLSearchParams(String(url.hash || "").replace(/^#/, ""));
    hashParams.delete("alimailActivate");
    const nextHash = hashParams.toString();
    url.hash = nextHash ? `#${nextHash}` : "";
    if (String(window.name || "").startsWith(WINDOW_NAME_PREFIX)) {
      window.name = "";
    }
    window.history.replaceState({}, "", url.toString());
  }

  async function run(envelope) {
    showNotice(`AliMail 激活器：开始处理激活请求（来源：${activation.source}）...`);

    if (envelope.targetMailbox) {
      const matched = await detectMailbox(envelope.targetMailbox, 12000);
      if (!matched) {
        const goOn = window.confirm(
          `未能自动确认当前登录邮箱是 ${envelope.targetMailbox}。是否继续执行激活？`,
        );
        if (!goOn) {
          showNotice("已取消激活：邮箱上下文未确认。", true);
          return;
        }
      }
    }

    if (envelope.mode === "all") {
      saveTemplateBundle(envelope.targetMailbox || "default", envelope.templates);
    }

    await applyTemplate(envelope.activeTemplate);

    const modeMessage =
      envelope.mode === "all"
        ? `已同步 ${envelope.templates.length} 个模板，并激活当前模板。`
        : "已激活当前模板。";

    showNotice(`AliMail 激活器：${modeMessage} 请在页面检查保存结果。`, false);
  }

  function saveTemplateBundle(mailbox, templates) {
    const key = `katvr_alimail_template_bundle__${mailbox.toLowerCase()}`;
    const payload = {
      mailbox,
      count: templates.length,
      templates,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (_error) {
      // Ignore local storage failures.
    }
  }

  async function detectMailbox(targetMailbox, timeoutMs) {
    const expected = normalize(targetMailbox);
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const bodyText = normalize(document.body?.innerText || "");
      if (bodyText.includes(expected)) {
        return true;
      }
      await sleep(400);
    }

    return false;
  }

  async function applyTemplate(template) {
    if (!template || typeof template !== "object") {
      throw new Error("模板数据无效");
    }

    if (isRuleListPage() || looksLikeRulePage()) {
      await applyTemplateToMailRule(template);
      return;
    }

    showNotice("AliMail 激活器：正在自动填写模板...");
    await ensureAutoReplyPanel();
    await sleep(500);

    const enableSwitch = findClickableByText([
      "开启自动回复",
      "启用自动回复",
      "自动回复",
      "Auto Reply",
      "Out of office",
    ]);
    if (enableSwitch) {
      safeClick(enableSwitch);
      await sleep(140);
    }

    const subjectApplied = setFieldByLabel(["主题", "Subject"], template.subject || "");
    const bodyApplied = setBody(template.bodyText || "");

    if (!subjectApplied && !bodyApplied) {
      if (looksLikeRulePage()) {
        throw new Error(
          "已读取激活包，但当前页面更像“收信规则 / 邮件规则”界面。现有插件仍在寻找“自动回复 / 假期回复”面板，因此不会改动规则。",
        );
      }
      throw new Error("已读取激活包，但未找到可填写的主题或正文输入框。");
    }

    if (template.startAt && template.endAt) {
      setFieldByLabel(["开始", "Start"], template.startAt);
      setFieldByLabel(["结束", "End"], template.endAt);
    }

    applyScope(template.scope);

    await sleep(180);
    const saveButton = findClickableByText(["保存", "确定", "启用", "保存设置", "Save", "Apply"]);
    if (saveButton) {
      safeClick(saveButton);
      return;
    }

    showNotice("AliMail 激活器：未找到保存按钮，请手动点保存。", true);
  }

  async function applyTemplateToMailRule(template) {
    showNotice("AliMail 激活器：正在新建收信规则...");
    await ensureMailRulePanel();
    await sleep(400);

    const createButton = await waitForClickable(["新建规则", "新建收信规则", "Create Rule", "New Rule"], 6000);
    if (!createButton) {
      throw new Error("已进入收信规则页，但未找到“新建规则”按钮。");
    }
    safeClick(createButton);
    await sleep(900);

    await waitForElement('[data-testid="auto-reply-action-editor"]', 8000);

    setFieldByLabel(["规则名称", "名称", "Rule Name", "Name"], template.ruleName || buildFallbackRuleName(template));

    const keywordsApplied = await applyRuleKeywords(template);
    if (!keywordsApplied) {
      throw new Error("已进入收信规则编辑页，但未找到可填写的关键词条件输入框。");
    }

    const actionApplied = enableAutoReplyAction();
    if (!actionApplied) {
      throw new Error("已进入收信规则编辑页，但未找到“自动回复”动作。");
    }
    await sleep(400);

    const replyEditor = await waitForEditableField(
      '[data-testid="auto-reply-action-editor"] [data-testid="auto-reply-textarea"]',
      4000,
    );
    const bodyApplied =
      (replyEditor ? setInputValue(replyEditor, template.bodyText || "") || true : false) ||
      setFieldByLabel(["自动回复", "回复内容", "正文", "Body", "Content"], template.bodyText || "") ||
      setBody(template.bodyText || "");
    if (!bodyApplied) {
      throw new Error("已进入收信规则编辑页，但未找到自动回复内容输入框。");
    }

    await sleep(260);
    const saveButton = findClickableByText(["确定", "保存", "创建", "OK", "Save"]);
    if (saveButton) {
      safeClick(saveButton);
      return;
    }

    showNotice("AliMail 激活器：规则已填写，但未找到保存按钮，请手动点保存。", true);
  }

  async function ensureMailRulePanel() {
    if (isRuleListPage()) {
      return;
    }

    const steps = [
      ["设置", "邮箱设置", "Settings"],
      ["收信规则", "邮件规则", "过滤器规则", "Receiving Rules", "Mail Rules", "Filters"],
    ];

    for (const labels of steps) {
      const target = await waitForClickable(labels, 2800);
      if (target) {
        safeClick(target);
        await sleep(560);
      }
    }
  }

  async function ensureAutoReplyPanel() {
    const steps = [
      ["设置", "邮箱设置", "Settings"],
      ["自动回复", "自动答复", "假期回复", "Out of office", "Auto Reply"],
    ];

    for (const labels of steps) {
      const target = await waitForClickable(labels, 2600);
      if (target) {
        safeClick(target);
        await sleep(520);
      }
    }
  }

  async function applyRuleKeywords(template) {
    const hints = Array.isArray(template.keywordHints)
      ? template.keywordHints.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 8)
      : [];
    if (hints.length === 0) {
      return false;
    }

    const matchFields = normalize(template.matchFields || "");
    const targetedContainers = [];
    if (matchFields.includes("subject")) {
      targetedContainers.push("subject-condition");
    }
    if (matchFields.includes("body")) {
      targetedContainers.push("body-condition");
    }

    for (const testId of targetedContainers) {
      const applied = await addKeywordsByTestId(testId, hints);
      if (applied) {
        return true;
      }
    }

    const targets = [["主题", "Subject"], ["正文", "邮件正文", "Body", "Content"], ["关键字", "关键词", "Keyword"]];
    for (const labels of targets) {
      const applied = await addKeywordsNearLabel(labels, hints);
      if (applied) {
        return true;
      }
    }

    return false;
  }

  async function addKeywordsByTestId(testId, values) {
    const container = document.querySelector(`[data-testid="${testId}"]`);
    if (!container || !isVisible(container)) {
      return false;
    }

    ensureCheckboxChecked(container);
    await sleep(220);

    const tagsBase =
      container.querySelector('[data-testid="tags-input-base"]') ||
      container.querySelector('[data-testid="keywords-input-container"]') ||
      container;

    safeClick(tagsBase);
    await sleep(180);

    const field =
      (await waitForEditableFieldIn(tagsBase, 1200)) ||
      findFirstVisible(
        Array.from(document.querySelectorAll("input, textarea, [contenteditable='true']")).filter((element) => {
          if (!isTextEntryElement(element)) return false;
          return container.contains(element) || element === document.activeElement;
        }),
      ) ||
      (isTextEntryElement(document.activeElement) ? document.activeElement : null);

    if (!field) {
      return false;
    }

    values.forEach((value, index) => appendKeywordValue(field, value, index === 0));
    return true;
  }

  async function addKeywordsNearLabel(labels, values) {
    const trigger = findClickableByText(labels);
    if (trigger) {
      safeClick(trigger);
      await sleep(180);
    }

    const field =
      findTextFieldNearLabel(labels) ||
      findKeywordFieldByPlaceholder(labels) ||
      findFirstVisible(
        Array.from(document.querySelectorAll("input, textarea, [contenteditable='true']")).filter(isTextEntryElement),
      );

    if (!field) {
      return false;
    }

    let applied = false;
    values.forEach((value, index) => {
      if (!value) return;
      appendKeywordValue(field, value, index === 0);
      applied = true;
    });
    return applied;
  }

  function enableAutoReplyAction() {
    const container = document.querySelector('[data-testid="auto-reply-action-editor"]');
    if (container && isVisible(container)) {
      return ensureCheckboxChecked(container);
    }

    const actionTarget = findClickableByText(["自动回复", "回复邮件", "Auto Reply"]);
    if (!actionTarget) {
      return false;
    }
    safeClick(actionTarget);
    return true;
  }

  function buildFallbackRuleName(template) {
    const templateId = String(template.templateId || "KATVR_RULE").trim();
    const locale = String(template.locale || "").trim();
    return locale ? `${templateId} ${locale}` : templateId;
  }

  function applyScope(scope) {
    const map = {
      all: ["所有发件人", "全部", "All senders", "Everyone"],
      internal: ["仅内部", "内部", "Internal"],
      external: ["仅外部", "外部", "External"],
    };
    const labels = map[String(scope || "").toLowerCase()];
    if (!labels) return;
    const target = findClickableByText(labels);
    if (target) safeClick(target);
  }

  function setBody(text) {
    if (!text) return false;

    const textarea = findFirstVisible(document.querySelectorAll("textarea"));
    if (textarea) {
      setInputValue(textarea, text);
      return true;
    }

    const rich = findFirstVisible(document.querySelectorAll('[contenteditable="true"]'));
    if (rich) {
      rich.focus();
      rich.innerText = text;
      rich.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }

    return false;
  }

  function setFieldByLabel(labels, value) {
    if (!value) return false;

    const field = findInputNearLabel(labels);
    if (field) {
      setInputValue(field, value);
      return true;
    }

    const candidate = findFirstVisible(
      Array.from(document.querySelectorAll("input, textarea")).filter((el) =>
        labels.some((label) => normalize(el.placeholder || "").includes(normalize(label))),
      ),
    );

    if (candidate) {
      setInputValue(candidate, value);
      return true;
    }

    return false;
  }

  function findInputNearLabel(labels) {
    const allNodes = Array.from(document.querySelectorAll("label, span, div, p, td"));
    const matched = allNodes.find((node) => {
      const text = normalize(node.textContent || "");
      return labels.some((label) => text.includes(normalize(label)));
    });

    if (!matched) return null;

    const direct = findFirstVisible(
      matched.querySelectorAll ? matched.querySelectorAll("input, textarea, [contenteditable='true']") : [],
    );
    if (direct) return direct;

    const container =
      matched.closest(".form-item, .ant-form-item, .form-group, .setting-item, tr, li, div") ||
      matched.parentElement;
    if (!container) return null;

    return findFirstVisible(container.querySelectorAll("input, textarea, [contenteditable='true']"));
  }

  function findTextFieldNearLabel(labels) {
    const allNodes = Array.from(document.querySelectorAll("label, span, div, p, td"));
    const matched = allNodes.find((node) => {
      const text = normalize(node.textContent || "");
      return labels.some((label) => text.includes(normalize(label)));
    });

    if (!matched) return null;

    const direct = findFirstVisible(
      Array.from(
        matched.querySelectorAll ? matched.querySelectorAll("input, textarea, [contenteditable='true']") : [],
      ).filter(isTextEntryElement),
    );
    if (direct) return direct;

    const container =
      matched.closest(".form-item, .ant-form-item, .form-group, .setting-item, tr, li, div") ||
      matched.parentElement;
    if (!container) return null;

    return findFirstVisible(Array.from(container.querySelectorAll("input, textarea, [contenteditable='true']")).filter(isTextEntryElement));
  }

  function findKeywordFieldByPlaceholder(labels) {
    const labelNorms = labels.map((label) => normalize(label));
    return findFirstVisible(
      Array.from(document.querySelectorAll("input, textarea, [contenteditable='true']")).filter((element) => {
        if (!isTextEntryElement(element)) return false;
        const placeholder = normalize(
          element.placeholder || element.getAttribute?.("aria-label") || element.getAttribute?.("data-placeholder") || "",
        );
        if (!placeholder) return false;
        return labelNorms.some((label) => placeholder.includes(label));
      }),
    );
  }

  function setInputValue(element, value) {
    const text = String(value);
    element.focus();

    if (element.matches("[contenteditable='true']")) {
      element.innerText = text;
    } else {
      element.value = text;
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.blur();
    return true;
  }

  function appendKeywordValue(element, value, overwrite) {
    const text = String(value || "").trim();
    if (!text) {
      return;
    }

    element.focus();
    if (element.matches("[contenteditable='true']")) {
      if (overwrite) {
        element.innerText = text;
      } else {
        element.innerText = text;
      }
    } else {
      element.value = text;
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        bubbles: true,
        cancelable: true,
      }),
    );
    element.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: "Enter",
        code: "Enter",
        bubbles: true,
      }),
    );
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function waitForClickable(labels, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const button = findClickableByText(labels);
      if (button) return button;
      await sleep(220);
    }
    return null;
  }

  function findClickableByText(labels) {
    const selectors = ["button", "a", "[role='button']", ".ant-btn", ".btn", "span", "div"];
    const nodes = Array.from(document.querySelectorAll(selectors.join(",")));
    const labelNorms = labels.map((label) => normalize(label));

    return nodes.find((node) => {
      if (!isVisible(node)) return false;
      const text = normalize(node.textContent || "");
      if (!text) return false;
      return labelNorms.some((label) => text.includes(label));
    });
  }

  function safeClick(element) {
    try {
      element.click();
    } catch (_error) {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      element.dispatchEvent(event);
    }
  }

  function findFirstVisible(elements) {
    const list = Array.from(elements || []);
    return list.find((item) => isVisible(item)) || null;
  }

  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function ensureCheckboxChecked(container) {
    const input = container.querySelector('input[type="checkbox"]');
    if (!input) {
      return false;
    }
    if (input.checked) {
      return true;
    }

    const clickable =
      input.closest("label") ||
      container.querySelector("label") ||
      input.nextElementSibling ||
      input;
    safeClick(clickable);
    return Boolean(input.checked || container.querySelector(".ant-checkbox-checked"));
  }

  async function waitForElement(selector, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const node = document.querySelector(selector);
      if (node && isVisible(node)) {
        return node;
      }
      await sleep(220);
    }
    return null;
  }

  async function waitForEditableField(selector, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const node = document.querySelector(selector);
      if (isEditableTextField(node)) {
        return node;
      }
      await sleep(220);
    }
    return null;
  }

  async function waitForEditableFieldIn(container, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const node = findFirstVisible(
        Array.from(container.querySelectorAll("input, textarea, [contenteditable='true']")).filter(isEditableTextField),
      );
      if (node) {
        return node;
      }
      await sleep(180);
    }
    return null;
  }

  function isTextEntryElement(element) {
    if (!element || !isVisible(element)) return false;
    if (element.matches("textarea, [contenteditable='true']")) {
      return true;
    }

    const type = String(element.type || "text").toLowerCase();
    return !["hidden", "checkbox", "radio", "button", "submit", "reset", "file", "range", "color"].includes(type);
  }

  function isEditableTextField(element) {
    if (!isTextEntryElement(element)) return false;
    if (element.matches("[contenteditable='true']")) {
      return String(element.getAttribute("contenteditable")).toLowerCase() !== "false";
    }
    return !element.disabled && !element.readOnly;
  }

  function normalize(text) {
    return String(text).trim().replace(/\s+/g, " ").toLowerCase();
  }

  function isRuleListPage() {
    return String(window.location.pathname || "").includes("/setting/mail-filter-rule-list");
  }

  function looksLikeRulePage() {
    const bodyText = normalize(document.body?.innerText || "");
    return ["收信规则", "邮件规则", "过滤器规则", "mail rules", "filters"].some((label) =>
      bodyText.includes(normalize(label)),
    );
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function showIdleNotice() {
    if (!String(window.location.pathname || "").includes("/alimail/")) {
      return;
    }
    if (window.__katvrActivatorIdleShown) {
      return;
    }
    window.__katvrActivatorIdleShown = true;
    showNotice("AliMail 激活器：已加载，等待激活指令。", false, 4200);
  }

  function showNotice(text, isError, timeoutMs) {
    const id = "katvr-alimail-activator-toast";
    let toast = document.getElementById(id);
    if (!toast) {
      toast = document.createElement("div");
      toast.id = id;
      toast.style.position = "fixed";
      toast.style.right = "16px";
      toast.style.bottom = "16px";
      toast.style.zIndex = "999999";
      toast.style.maxWidth = "520px";
      toast.style.padding = "10px 14px";
      toast.style.borderRadius = "10px";
      toast.style.boxShadow = "0 8px 20px rgba(0,0,0,0.22)";
      toast.style.fontSize = "13px";
      toast.style.lineHeight = "1.4";
      toast.style.color = "#fff";
      toast.style.background = "#14695f";
      document.body.appendChild(toast);
    }

    toast.textContent = text;
    toast.style.background = isError ? "#a62f2f" : "#14695f";

    window.clearTimeout(window.__katvrActivatorToastTimer);
    window.__katvrActivatorToastTimer = window.setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, Number.isFinite(timeoutMs) ? timeoutMs : 10000);
  }
})();
