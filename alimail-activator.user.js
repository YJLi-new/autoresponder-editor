// ==UserScript==
// @name         KATVR AliMail Auto Reply Activator
// @namespace    https://yjli-new.github.io/autoresponder-editor/
// @version      1.0.0
// @description  Read activation payload from URL and apply auto-reply settings in AliMail.
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

  const payload = parsePayload(encoded);
  if (!payload) {
    showNotice("AliMail 激活器：参数解析失败", true);
    return;
  }

  removeQueryParam("alimailActivate");
  run(payload).catch((error) => {
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
      const json = JSON.parse(text);
      if (!json || typeof json !== "object") {
        return null;
      }
      return json;
    } catch (_error) {
      return null;
    }
  }

  function removeQueryParam(key) {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState({}, "", url.toString());
  }

  async function run(data) {
    showNotice("AliMail 激活器：开始自动填写...");

    await ensureAutoReplyPanel();
    await sleep(500);

    // Ensure auto-reply switch is enabled if a matching switch is found.
    const enableSwitch = findClickableByText([
      "开启自动回复",
      "启用自动回复",
      "自动回复",
      "Auto Reply",
      "Out of office",
    ]);
    if (enableSwitch) {
      safeClick(enableSwitch);
      await sleep(120);
    }

    setFieldByLabel(["主题", "Subject"], data.subject || "");
    setBody(data.bodyText || "");

    if (data.startAt && data.endAt) {
      setFieldByLabel(["开始", "Start"], data.startAt);
      setFieldByLabel(["结束", "End"], data.endAt);
    }

    applyScope(data.scope);

    await sleep(150);
    const saveButton = findClickableByText(["保存", "确定", "启用", "保存设置", "Save", "Apply"]);
    if (saveButton) {
      safeClick(saveButton);
      showNotice("AliMail 激活器：已尝试保存自动回复。请在页面确认结果。", false);
      return;
    }

    showNotice("AliMail 激活器：未找到保存按钮，请手动点保存。", true);
  }

  async function ensureAutoReplyPanel() {
    // Try to navigate by common menu texts.
    const steps = [
      ["设置", "邮箱设置", "Settings"],
      ["自动回复", "自动答复", "假期回复", "Out of office", "Auto Reply"],
    ];

    for (const labels of steps) {
      const target = await waitForClickable(labels, 2500);
      if (target) {
        safeClick(target);
        await sleep(500);
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
    if (target) {
      safeClick(target);
    }
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
      return;
    }
  }

  function setFieldByLabel(labels, value) {
    if (!value) return;

    const field = findInputNearLabel(labels);
    if (field) {
      setInputValue(field, value);
      return;
    }

    // Fallback by placeholder.
    const candidate = findFirstVisible(
      Array.from(document.querySelectorAll("input, textarea")).filter((el) =>
        labels.some((label) => normalize((el.placeholder || "")).includes(normalize(label))),
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

    const container = matched.closest(".form-item, .ant-form-item, .form-group, .setting-item, tr, li, div") || matched.parentElement;
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
      await sleep(200);
    }
    return null;
  }

  function findClickableByText(labels) {
    const selectors = [
      "button",
      "a",
      "[role='button']",
      ".ant-btn",
      ".btn",
      "span",
      "div",
    ];

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
      toast.style.maxWidth = "460px";
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
    }, 8000);
  }
})();
