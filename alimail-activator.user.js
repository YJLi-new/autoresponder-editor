// ==UserScript==
// @name         KATVR AliMail Auto Reply Activator
// @namespace    https://yjli-new.github.io/autoresponder-editor/
// @version      1.1.0
// @description  Read activation payload from URL and apply auto-reply settings in AliMail enterprise web.
// @match        https://qiye.aliyun.com/*
// @match        https://mail.aliyun.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const search = new URLSearchParams(window.location.search);
  const encoded = search.get("alimailActivate");
  if (!encoded) {
    return;
  }

  const rawPayload = parsePayload(encoded);
  const envelope = normalizeEnvelope(rawPayload);
  if (!envelope) {
    showNotice("AliMail 激活器：参数解析失败", true);
    return;
  }

  removeQueryParam("alimailActivate");
  run(envelope).catch((error) => {
    console.error("[AliMail Activator] failed:", error);
    showNotice(`AliMail 激活失败：${error.message}`, true);
  });

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
        requireSmsVerification: payload.requireSmsVerification !== false,
        activeTemplate: payload.activeTemplate,
        templates: Array.isArray(payload.templates) ? payload.templates : [payload.activeTemplate],
      };
    }

    if (typeof payload.subject === "string") {
      return {
        version: 2,
        mode: "current",
        targetMailbox: "",
        requireSmsVerification: false,
        activeTemplate: payload,
        templates: [payload],
      };
    }

    return null;
  }

  function removeQueryParam(key) {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState({}, "", url.toString());
  }

  async function run(envelope) {
    showNotice("AliMail 激活器：开始处理激活请求...");

    if (envelope.requireSmsVerification) {
      const pass = window.confirm(
        "请确认你已在阿里企业邮箱完成“手机号短信验证码”登录校验，再点击“确定”继续激活。",
      );
      if (!pass) {
        showNotice("已取消激活：未确认短信验证码登录。", true);
        return;
      }
    }

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

    setFieldByLabel(["主题", "Subject"], template.subject || "");
    setBody(template.bodyText || "");

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
    if (!text) return;

    const textarea = findFirstVisible(document.querySelectorAll("textarea"));
    if (textarea) {
      setInputValue(textarea, text);
      return;
    }

    const rich = findFirstVisible(document.querySelectorAll('[contenteditable="true"]'));
    if (rich) {
      rich.focus();
      rich.innerText = text;
      rich.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function setFieldByLabel(labels, value) {
    if (!value) return;

    const field = findInputNearLabel(labels);
    if (field) {
      setInputValue(field, value);
      return;
    }

    const candidate = findFirstVisible(
      Array.from(document.querySelectorAll("input, textarea")).filter((el) =>
        labels.some((label) => normalize(el.placeholder || "").includes(normalize(label))),
      ),
    );

    if (candidate) {
      setInputValue(candidate, value);
    }
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

  function normalize(text) {
    return String(text).trim().replace(/\s+/g, " ").toLowerCase();
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function showNotice(text, isError) {
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
    }, 10000);
  }
})();
