import fs from "node:fs";
import path from "node:path";

const DEFAULT_TEMPLATE_MD =
  "/mnt/e/KV/KATVR_邮箱自动回复规则与模板_v2_重新生成/KATVR_企业邮箱自动回复模板_v2_重新生成.md";
const DEFAULT_RULES_YAML =
  "/mnt/e/KV/KATVR_邮箱自动回复规则与模板_v2_重新生成/KATVR_企业邮箱自动回复规则_v2_重新生成.yaml";

const ROUTING_LABELS = {
  B2B_SALES_TEAM: "B2B 销售团队",
  SUPPORT_TEAM: "支持团队",
  TECH_TEAM: "技术团队",
  LOGISTICS_TEAM: "物流团队",
  FINANCE_TEAM: "财务团队",
  BIZDEV_MARKETING: "BD / 市场团队",
};

const EXCLUSION_SUMMARY =
  "命中内部非表单、自动回复/退信、渠道 campaign 回信、付款安全公告回信时，不发送自动回复。";
const KEYWORDS_REGEX_BY_TEMPLATE_ID = {
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
const PRIORITY_OVERRIDES_BY_TEMPLATE_ID = {
  TPL_SUPPORT_AFTERSALES_ACK: 900,
  TPL_SDK_TECH_ACK: 890,
  TPL_INVOICE_PAYMENT_ACK: 880,
  TPL_QUOTE_PRICING_ACK: 860,
  TPL_SHIPPING_LOGISTICS_ACK: 855,
  TPL_ORDER_PROCUREMENT_ACK: 850,
  TPL_EDU_TRAINING_ACK: 840,
  TPL_PARTNERSHIP_CHANNEL_ACK: 835,
  TPL_B2B_BUSINESS_ACK: 830,
  TPL_PRODUCT_SELECTION_COMPARE_ACK: 820,
  TPL_WEBSITE_PRODUCT_ACK: 810,
  TPL_GENERAL_ACK: 790,
};
const CLASSIFICATION_RULES = {
  exclusions: [
    {
      id: "EXCLUSION_SYSTEM_NOTICE",
      label: "系统 / 安全通知",
      scope: ["from", "subject", "body"],
      pattern: "/(来自no-reply@mailsupport\\.aliyun\\.com的退信|【阿里云邮】|异地登录|绑定手机)/i",
      action: "suppress_auto_reply",
    },
    {
      id: "EXCLUSION_VENDOR_REGISTRATION",
      label: "供应商注册 / 税务资料",
      scope: ["subject", "body"],
      pattern: "/(supplier registration|w-?8|vendor onboarding)/i",
      action: "suppress_auto_reply",
    },
    {
      id: "EXCLUSION_SEO_LINK_BUILDING",
      label: "SEO / 外链投放",
      scope: ["subject", "body"],
      pattern: "/(guest post|publish an article|do-follow link|link insertion|casino|fintech)/i",
      action: "suppress_auto_reply",
    },
  ],
  overrides: [
    {
      id: "OVERRIDE_SUPPORT_DETAIL_CREATOR",
      label: "support-detail 被误用于合作提案时改走 Partnership",
      conditions: [
        {
          scope: ["subject", "body"],
          pattern: "/support-detail|professionalsupport/i",
        },
        {
          scope: ["subject", "body"],
          pattern: "/(creator|podcast|review|showcas(e|ing)|product testing|collab|influencer)/i",
        },
      ],
      action: {
        mode: "force_template",
        templateId: "TPL_PARTNERSHIP_CHANNEL_ACK",
      },
    },
  ],
  reviewRules: [
    {
      id: "REVIEW_BLANK_NUMBERED_FORM",
      label: "未分类编号表单先走人工复核",
      scope: ["subject"],
      pattern: "/new contact form from \\(No\\.\\d{5,}\\)/i",
      action: {
        mode: "manual_review",
        suggestedTemplateId: "TPL_GENERAL_ACK",
      },
    },
  ],
  productProfiles: [
    {
      id: "kat-walk-mini-s",
      displayNameZh: "KAT Walk Mini S",
      displayNameEn: "KAT Walk Mini S",
      pagePattern: "/kat-walk-mini-s/i",
      contentPattern: "/\\bkat walk mini s\\b/i",
    },
    {
      id: "kat-walk-c2-plus",
      displayNameZh: "KAT Walk C2 Plus",
      displayNameEn: "KAT Walk C2 Plus",
      pagePattern: "/kat-walk-c-2-plus/i",
      contentPattern: "/\\bkat walk c2\\+?\\b|\\bc2pe\\b|\\bc2 plus\\b/i",
    },
    {
      id: "kat-walk-c2-core",
      displayNameZh: "KAT Walk C2 Core",
      displayNameEn: "KAT Walk C2 Core",
      pagePattern: "/kat-walk-c-2-core/i",
      contentPattern: "/\\bc2 core\\b/i",
    },
    {
      id: "kat-pro-walk-mecha",
      displayNameZh: "KAT Pro Walk Mecha",
      displayNameEn: "KAT Pro Walk Mecha",
      pagePattern: "/kat-pro/i",
      contentPattern: "/\\bkat pro\\b|\\bwalk mecha\\b/i",
    },
    {
      id: "kat-loco-s",
      displayNameZh: "KAT Loco S",
      displayNameEn: "KAT Loco S",
      pagePattern: "/kat-loco-s/i",
      contentPattern: "/\\bkat loco s\\b|\\bloco s\\b/i",
    },
    {
      id: "kat-vehicle-hub-nexus",
      displayNameZh: "Vehicle Hub / Nexus",
      displayNameEn: "Vehicle Hub / Nexus",
      pagePattern: "/kat-walk-c-2-series-vehicle-hub|kat-nexus/i",
      contentPattern: "/\\bvehicle hub\\b|\\bnexus\\b/i",
    },
  ],
  resolutionPolicy: {
    mode: "neutral_unless_exact_match",
    precedence: ["pagePattern", "contentPattern"],
    multiMatchBehavior: "neutral",
    familyMatchBehavior: "neutral",
    noMatchBehavior: "neutral",
  },
};

const TEMPLATE_LOCALIZATION = {
  TPL_WEBSITE_PRODUCT_ACK: {
    category: "网站产品咨询确认",
    zhName: "网站产品咨询确认（中文）",
    enName: "Website Product Inquiry Ack (English)",
    zhSubject: "回复：已收到您对 KAT VR 产品的咨询",
    enSubject: "Re: KAT VR product inquiry received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的产品咨询，团队会结合您留言所在页面或实际场景确认更合适的型号。\n\n供您先快速了解当前产品线：\n{{OurPortfolioBlock}}\n\n如果您已经有明确型号偏好，我们会在后续跟进中按该产品提供更具体的资料、兼容性和报价信息。\n\n参考页面：\n{{OurCatalogOrPageURL}}",
    zhSignature: "此致\n{{OurReplySignature}}",
    enOpening: "Hello,",
    enBody:
      "Thank you for contacting KAT VR.\n\nWe have received your product inquiry and our team will review the specific page or scenario you mentioned before recommending the best-fit model.\n\nFor a quick overview of our lineup:\n{{OurPortfolioBlock}}\n\nIf you already have a preferred model, our team will follow up with information specific to that product.\n\nReference page:\n{{OurCatalogOrPageURL}}",
    enSignature: "Best regards,\n{{OurReplySignature}}",
  },
  TPL_B2B_BUSINESS_ACK: {
    category: "B2B 商业线索确认",
    zhName: "B2B 商业线索确认（中文）",
    enName: "B2B Business Lead Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 商业咨询",
    enSubject: "Re: KAT VR business inquiry received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的商业咨询，B2B 团队正在查看。\n\nKAT VR 商业方案通常覆盖以下范围：\n{{OurBusinessSolutionBlock}}\n\n供您先快速了解当前产品线：\n{{OurPortfolioBlock}}\n\n参考页面：\n{{OurCatalogOrPageURL}}\n\n销售团队会结合您的场景、数量和部署需求继续跟进，并提供更合适的商业建议。",
    zhSignature: "此致\n{{OurReplySignature}}",
    enOpening: "Hello,",
    enBody:
      "Thank you for contacting KAT VR.\n\nWe have received your business inquiry and our B2B team is reviewing it.\n\nKAT VR business solutions usually cover the following scope:\n{{OurBusinessSolutionBlock}}\n\nFor a quick overview of our lineup:\n{{OurPortfolioBlock}}\n\nReference page:\n{{OurCatalogOrPageURL}}\n\nOur sales team will follow up based on your scenario, quantity and deployment needs and provide a more suitable commercial recommendation.",
    enSignature: "Best regards,\n{{OurReplySignature}}",
  },
  TPL_PRODUCT_SELECTION_COMPARE_ACK: {
    category: "产品选型 / 对比咨询确认",
    zhName: "产品选型 / 对比咨询确认（中文）",
    enName: "Product Selection Compare Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 产品选型咨询",
    enSubject: "Re: KAT VR product selection inquiry received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的产品选型 / 对比咨询，团队会结合您的使用场景继续评估更合适的型号。\n\n供您先快速了解当前产品线：\n{{OurPortfolioBlock}}\n\n如果您已经在比较具体型号，我们会在后续跟进中补充差异点、适用场景和兼容性信息。\n\n参考页面：\n{{OurCatalogOrPageURL}}\n\n相关同事会尽快继续跟进，并给出更贴合您需求的建议。",
    zhSignature: "此致\n{{OurReplySignature}}",
    enOpening: "Hello,",
    enBody:
      "Thank you for contacting KAT VR.\n\nWe have received your product selection / comparison inquiry, and our team will continue evaluating the most suitable model for your scenario.\n\nFor a quick overview of our lineup:\n{{OurPortfolioBlock}}\n\nIf you are already comparing specific models, we will follow up with the key differences, suitable scenarios and compatibility details.\n\nReference page:\n{{OurCatalogOrPageURL}}\n\nOur team will follow up shortly with a more tailored recommendation.",
    enSignature: "Best regards,\n{{OurReplySignature}}",
  },
  TPL_SUPPORT_AFTERSALES_ACK: {
    category: "售后支持确认",
    zhName: "售后支持确认（中文）",
    enName: "Support After-Sales Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 支持请求",
    enSubject: "Re: KAT VR support request received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR 支持团队。\n\n我们已收到您的留言，支持团队会尽快查看。\n\n售后与支持参考如下：\n{{OurWarrantyOrSupportInfo}}\n\n官方支持渠道：\n{{OurSupportContactBlock}}\n\n如果您的情况涉及配件、备件或替换组件，我们会在后续跟进中确认库存与下一步支持方式。",
    zhSignature: "此致\n{{OurReplySignature}}",
  },
  TPL_SDK_TECH_ACK: {
    category: "SDK / 技术集成咨询确认",
    zhName: "SDK / 技术集成咨询确认（中文）",
    enName: "SDK Technical Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 技术咨询",
    enSubject: "Re: KAT VR technical inquiry received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的技术咨询，相关团队会尽快查看。\n\n供您快速参考：\n{{OurCompatibilityOrSoftwareInfo}}\n\n相关页面：\n{{OurCatalogOrPageURL}}\n\n技术团队会尽快继续跟进，并提供更合适的软件 / 集成建议。",
    zhSignature: "此致\n{{OurReplySignature}}",
  },
  TPL_QUOTE_PRICING_ACK: {
    category: "报价 / 价格咨询确认",
    zhName: "报价 / 价格咨询确认（中文）",
    enName: "Quote Pricing Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 报价请求",
    enSubject: "Re: KAT VR quotation request received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的报价请求，销售团队正在查看。\n\n我们会根据型号、数量、目的地和贸易条款提供更有针对性的报价。\n\n供您先快速了解当前产品线：\n{{OurPortfolioBlock}}\n\n参考资料：\n{{OurCatalogOrPageURL}}\n\n商务说明：\n{{OurShippingLeadTimeNote}}\n\n付款安全提醒：\n{{OurPaymentSecurityNotice}}\n\n后续会由团队结合您的需求提供更有针对性的报价。",
    zhSignature: "此致\n{{OurReplySignature}}",
    enOpening: "Hello,",
    enBody:
      "Thank you for contacting KAT VR.\n\nWe have received your quotation request and our sales team is reviewing it.\n\nWe will provide a more targeted quotation based on the model, quantity, destination and trade terms.\n\nFor a quick overview of our lineup:\n{{OurPortfolioBlock}}\n\nReference materials:\n{{OurCatalogOrPageURL}}\n\nCommercial note:\n{{OurShippingLeadTimeNote}}\n\nPayment security reminder:\n{{OurPaymentSecurityNotice}}\n\nOur team will follow up with a more tailored quotation.",
    enSignature: "Best regards,\n{{OurReplySignature}}",
  },
  TPL_SHIPPING_LOGISTICS_ACK: {
    category: "物流 / 交付咨询确认",
    zhName: "物流 / 交付咨询确认（中文）",
    enName: "Shipping Logistics Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 物流咨询",
    enSubject: "Re: KAT VR logistics inquiry received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的物流相关咨询，团队正在查看。\n\n一般物流参考如下：\n{{OurShippingLeadTimeNote}}\n\n如果您的问题涉及目的地可达性、运输方式、交期、安装或 EXW / FCA / CIF / DDP 等条款，物流团队会在后续跟进中确认更合适的路线与下一步安排。\n\n参考页面：\n{{OurCatalogOrPageURL}}\n\n物流团队会尽快继续跟进并补充下一步信息。",
    zhSignature: "此致\n{{OurReplySignature}}",
    enOpening: "Hello,",
    enBody:
      "Thank you for contacting KAT VR.\n\nWe have received your logistics inquiry and our team is reviewing it.\n\nFor general shipping reference:\n{{OurShippingLeadTimeNote}}\n\nIf your inquiry concerns destination availability, shipping method, lead time, assembly, installation, or trade terms such as EXW / FCA / CIF / DDP, our logistics team will confirm the most suitable route and next step in follow-up.\n\nReference page:\n{{OurCatalogOrPageURL}}\n\nA logistics follow-up will be shared shortly.",
    enSignature: "Best regards,\n{{OurReplySignature}}",
  },
  TPL_INVOICE_PAYMENT_ACK: {
    category: "发票 / 付款确认",
    zhName: "发票 / 付款确认（中文）",
    enName: "Invoice Payment Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 付款相关请求",
    enSubject: "Re: KAT VR payment-related request received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的发票 / 付款相关请求，财务团队正在查看。\n\n付款安全说明：\n{{OurPaymentSecurityNotice}}\n\n如果您的请求与报价或出货相关，财务与销售团队会在后续跟进中协调下一步处理。",
    zhSignature: "此致\n{{OurReplySignature}}",
  },
  TPL_ORDER_PROCUREMENT_ACK: {
    category: "订单 / 采购确认",
    zhName: "订单 / 采购确认（中文）",
    enName: "Order Procurement Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 订单请求",
    enSubject: "Re: KAT VR order request received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的订单 / 采购相关请求，团队正在查看。\n\n如果您的请求涉及 PO 确认、单据更新、出货安排、订单变更或取消，团队会按实际情况继续处理。\n\n商务 / 物流说明：\n{{OurShippingLeadTimeNote}}\n\n付款安全提醒：\n{{OurPaymentSecurityNotice}}\n\n后续会由团队结合实际订单情况继续跟进下一步商务安排。",
    zhSignature: "此致\n{{OurReplySignature}}",
    enOpening: "Hello,",
    enBody:
      "Thank you for contacting KAT VR.\n\nWe have received your order / procurement-related request and our team is reviewing it.\n\nIf your request concerns PO confirmation, document update, shipment arrangement, order change or cancellation, our team will review the next step accordingly.\n\nCommercial / logistics note:\n{{OurShippingLeadTimeNote}}\n\nPayment security reminder:\n{{OurPaymentSecurityNotice}}\n\nOur team will continue the next commercial step based on your actual order situation.",
    enSignature: "Best regards,\n{{OurReplySignature}}",
  },
  TPL_EDU_TRAINING_ACK: {
    category: "教育 / 培训方案确认",
    zhName: "教育 / 培训方案确认（中文）",
    enName: "Education Training Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 教育 / 培训咨询",
    enSubject: "Re: KAT VR education and training inquiry received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的教育 / 培训相关咨询，团队正在查看。\n\n方案参考：\n{{OurBusinessSolutionBlock}}\n\n软件 / 技术参考：\n{{OurCompatibilityOrSoftwareInfo}}\n\n参考页面：\n{{OurCatalogOrPageURL}}\n\n相关同事会尽快继续跟进，并给出更合适的方案建议。",
    zhSignature: "此致\n{{OurReplySignature}}",
  },
  TPL_PARTNERSHIP_CHANNEL_ACK: {
    category: "渠道 / 合作提案确认",
    zhName: "渠道 / 合作提案确认（中文）",
    enName: "Partnership Channel Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 合作提案",
    enSubject: "Re: KAT VR partnership inquiry received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的合作相关信息，商务发展团队正在查看。\n\n供您快速了解 KAT VR：\n{{OurPortfolioBlock}}\n\n业务范围：\n{{OurBusinessSolutionBlock}}\n\n参考页面：\n{{OurCatalogOrPageURL}}\n\n团队会尽快继续跟进，并确认更匹配的合作方向。",
    zhSignature: "此致\n{{OurReplySignature}}",
  },
  TPL_GENERAL_ACK: {
    category: "通用咨询确认",
    zhName: "通用咨询确认（中文）",
    enName: "General Inquiry Ack (English)",
    zhSubject: "回复：已收到您的 KAT VR 咨询",
    enSubject: "Re: KAT VR inquiry received",
    zhOpening: "您好，",
    zhBody:
      "感谢您联系 KAT VR。\n\n我们已收到您的留言，相关团队会尽快查看。\n\n供您快速了解我们的产品线：\n{{OurPortfolioBlock}}\n\n参考页面：\n{{OurCatalogOrPageURL}}\n\n稍后会由合适的团队成员继续跟进。",
    zhSignature: "此致\n{{OurReplySignature}}",
  },
};

const templatePath = process.argv[2] || DEFAULT_TEMPLATE_MD;
const rulesPath = process.argv[3] || DEFAULT_RULES_YAML;

const templateMarkdown = fs.readFileSync(templatePath, "utf8").replace(/\r\n/g, "\n");
const rulesYaml = fs.readFileSync(rulesPath, "utf8").replace(/\r\n/g, "\n");

const templates = parseTemplateMarkdown(templateMarkdown);
const ruleMeta = parseRuleMeta(rulesYaml);
const routingGroups = parseRoutingGroups(rulesYaml);
const policySummary = buildPolicySummary(templatePath, rulesPath, templateMarkdown, rulesYaml, routingGroups);
const groups = buildGroups(templates, ruleMeta, routingGroups);

const payload = {
  version: 4,
  updatedAt: new Date().toISOString(),
  source: "KATVR v2 regenerated rules and templates",
  groups,
  policySummary,
  classificationRules: CLASSIFICATION_RULES,
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);

function buildGroups(templateSections, rulesByTemplate, routes) {
  return Object.keys(TEMPLATE_LOCALIZATION)
    .map((templateId) => {
      const template = templateSections.get(templateId);
      const rule = rulesByTemplate.get(templateId);
      const localization = TEMPLATE_LOCALIZATION[templateId];

      if (!template) {
        throw new Error(`Template section missing for ${templateId}`);
      }
      if (!rule) {
        throw new Error(`Rule metadata missing for ${templateId}`);
      }

      const english = splitEnglishTemplate(template.englishBody);
      const englishOpening = localization.enOpening || english.opening;
      const englishBody = localization.enBody || english.body;
      const englishSignature = localization.enSignature || english.signature;
      const routeGroup = routes.get(rule.routeTo);
      const routingLabel = buildRoutingLabel(rule.routeTo, routeGroup);
      const priority = PRIORITY_OVERRIDES_BY_TEMPLATE_ID[templateId] ?? rule.priority;
      const versions = {
        "zh-CN": {
          locale: "zh-CN",
          name: localization.zhName,
          startAt: "",
          endAt: "",
          scope: "external",
          subject: localization.zhSubject,
          opening: localization.zhOpening,
          body: localization.zhBody,
          signature: localization.zhSignature,
          updatedAt: new Date().toISOString(),
        },
        "en-US": {
          locale: "en-US",
          name: localization.enName,
          startAt: "",
          endAt: "",
          scope: "external",
          subject: localization.enSubject,
          opening: englishOpening,
          body: englishBody,
          signature: englishSignature,
          updatedAt: new Date().toISOString(),
        },
      };
      const placeholders = collectVersionPlaceholders(versions);

      return {
        groupId: templateId,
        category: localization.category,
        direction: "inbox",
        ruleId: rule.id,
        priority,
        matchFields: rule.matchFields,
        keywords: KEYWORDS_REGEX_BY_TEMPLATE_ID[templateId] || template.appliesTo,
        exclusions: templateId === "TPL_PARTNERSHIP_CHANNEL_ACK" ? `${EXCLUSION_SUMMARY} 不用于回复我方 partnership campaign 回信。` : EXCLUSION_SUMMARY,
        routing: routingLabel,
        sla: `自动确认后由${routingLabel.replace(/（.*$/, "")}继续人工跟进。`,
        placeholders,
        note: `${rule.note} 人工二次收集：${template.manualFollowup.join("；")}`,
        updatedAt: new Date().toISOString(),
        versions,
      };
    })
    .sort((left, right) => right.priority - left.priority);
}

function buildPolicySummary(templateSourcePath, rulesSourcePath, mdText, yamlText, routes) {
  return {
    title: "KAT VR 企业邮箱自动回复 V2 基线",
    sourceFiles: [
      path.basename(templateSourcePath),
      path.basename(rulesSourcePath),
    ],
    pluginActivationGuide: {
      overview:
        "编辑器仍保留有插件激活方案。安装 Tampermonkey 并启用 `alimail-activator.user.js` 后，点击“一键在 AliMail 激活”会把当前模板载荷带到 AliMail 页面，脚本会自动尝试打开自动回复设置、填写主题/正文并点击保存。",
      installSteps: [
        "在浏览器安装 Tampermonkey 扩展。",
        "打开 `https://raw.githubusercontent.com/YJLi-new/autoresponder-editor/main/alimail-activator.user.js`，按 Tampermonkey 提示安装脚本。",
        "在 Tampermonkey Dashboard 确认脚本已启用，并允许匹配 `https://qiye.aliyun.com/*` 与 `https://mail.aliyun.com/*`。",
        "首次安装后刷新一次 AliMail 企业邮箱页面，确保脚本开始接管该域名。",
      ],
      usageSteps: [
        "在编辑器中填写指定邮箱，并确认当前模板内容、占位符实际信息和激活范围无误。",
        "点击“一键在 AliMail 激活”；编辑器会把激活载荷附加到 AliMail 链接中并打开企业邮箱。",
        "若插件运行成功，AliMail 页面会出现 `AliMail 激活器：开始处理激活请求...` 的提示，并继续尝试打开自动回复面板和填写内容。",
        "如果插件能定位到保存按钮，会自动点保存；如果只填充未保存，页面会提示你手动确认并点击保存。",
      ],
      successChecks: [
        "AliMail 页面出现 `AliMail 激活器：已激活当前模板。` 或 `已同步 X 个模板，并激活当前模板。` 的提示。",
        "进入 AliMail 自动回复设置，检查主题和正文是否已替换为当前编辑器中的实际内容，而不是 `{{Our*}}` 占位符。",
        "用外部邮箱发送一封测试邮件，确认目标邮箱能回出最新自动回复。",
      ],
      troubleshooting: [
        "如果页面没有任何激活器提示，优先检查 Tampermonkey 是否启用、脚本是否启用，以及当前域名是否为 `qiye.aliyun.com` / `mail.aliyun.com`。",
        "如果脚本提示未找到自动回复入口或保存按钮，通常是 AliMail 页面结构变化；先手动保存一次，再把最新页面截图或 DOM 文本提供给维护者更新脚本。",
        "如果浏览器拦截新窗口，允许本站弹窗，或在提示时选择当前页打开 AliMail。",
      ],
    },
    keywordRegexGuide: {
      purpose:
        "“关键词/正则”描述的是模板层匹配线索；全局排除、覆盖和人工复核则放在独立的 Rule Engine 里。当前网页和 AliMail 激活流程不会直接执行这些规则，它们主要用于维护分类基线和后续可消费的结构化配置。",
      syntax:
        "统一写成标准 JavaScript 正则文本格式 `/pattern/flags`。推荐默认使用 `i` 做不区分大小写匹配；多个候选词用 `|` 连接。",
      flags: [
        "`i`：大小写不敏感，适合邮件主题和正文关键词识别",
        "`g`、`m` 默认不需要；只有在明确需要多行锚点时才考虑",
      ],
      authoringRules: [
        "对缩写词优先使用单词边界，例如 `\\bPI\\b`、`\\bPO\\b`、`\\bRFQ\\b`，避免误命中更长字符串。",
        "对字面量符号需要转义，例如匹配 `No.12345` 时应写 `No\\.\\d{5,}`。",
        "优先保留高信号词，不要把整句业务说明直接写进正则，避免模式过宽、难维护。",
        "如果一类线索来自固定页面或表单入口，可把稳定 slug 纳入正则，例如 `models-comparison`、`kat-walk-[^\\s]*`。",
        "高风险裸词应收窄，例如不要直接用 `business` 或 `support`；优先改成高信号短语和带边界的词。",
        "这栏描述的是模板适用线索，不等于 AliMail 页面中的最终规则条件；手动激活时仍需按页面引导把主题和正文保存到邮箱规则里。",
      ],
      examples: [
        "/(\\bpayment(?: terms?)?\\b|\\binvoice\\b|\\bproforma(?: invoice)?\\b|\\bPI\\b|\\bbank (?:account|details?)\\b)/i",
        "/(product page form|homepage form|product inquiry|new contact form from (kat-walk-[^\\\\s]*|kat-pro|kat-loco-s|kat-nexus)|\\bkat walk\\b|\\bvr treadmill\\b)/i",
      ],
    },
    subjectStrategy: {
      source: "源文件建议保留原线程主题，由邮件系统自动添加 Re: / 回复：。",
      editorFallback: "当前编辑器默认填充兼容 AliMail 的固定主题；如实际邮箱支持线程主题策略，可在应用前手动调整。",
    },
    defaultLanguage: parseSingleQuotedValue(yamlText, "default_language"),
    localizeWhen: parseSectionList(yamlText, "language_policy:", "reusable_keyword_sets:", "  localize_when:"),
    placeholderPolicy: {
      principle: parseSingleQuotedValue(yamlText, "principle"),
      namingRule: parseSingleQuotedValue(yamlText, "naming_rule"),
      allowed: parseSectionList(yamlText, "placeholder_policy:", "routing_groups:", "  allowed_product_side_placeholders:"),
      banned: parseSectionList(yamlText, "placeholder_policy:", "routing_groups:", "  banned_customer_side_placeholders:"),
      implementationNotes: parseSectionList(yamlText, "placeholder_policy:", "routing_groups:", "  implementation_note:"),
    },
    dedupeRules: parseQuotedRulesFromSection(yamlText, "dedupe_policy:", "language_policy:"),
    exclusionRules: parseExclusionRules(yamlText),
    routingGroups: Array.from(routes.values()),
    manualFlowNorms: parseManualFlowNorms(yamlText),
    defaultBlocks: parseDefaultBlocks(mdText),
  };
}

function parseTemplateMarkdown(markdown) {
  const sections = new Map();
  const regex =
    /^## (TPL_[A-Z0-9_]+)\n\*\*适用\*\*：(.+?)\n\*\*主题策略\*\*：(.+?)\n\n\*\*正文（英文）\*\*\n```text\n([\s\S]*?)\n```\n\n\*\*建议使用占位符\*\*\n([\s\S]*?)\n\n\*\*人工二次收集（不做占位符）\*\*\n([\s\S]*?)(?=\n---\n|\n## 四、建议维护的默认值)/gm;

  for (const match of markdown.matchAll(regex)) {
    sections.set(match[1], {
      id: match[1],
      appliesTo: normalizeInlineText(match[2]),
      subjectStrategy: normalizeInlineText(match[3]),
      englishBody: match[4].trim(),
      placeholders: parseMarkdownBullets(match[5]),
      manualFollowup: parseMarkdownBullets(match[6]),
    });
  }

  return sections;
}

function parseRuleMeta(yamlText) {
  const rulesSection = sliceSection(yamlText, "rules:", "manual_flow_norms:");
  const rulesByTemplate = new Map();
  const ruleRegex = /^  - id: "([^"]+)"\n([\s\S]*?)(?=^  - id: "|$(?![\s\S]))/gm;

  for (const match of rulesSection.matchAll(ruleRegex)) {
    const id = match[1];
    const block = match[2];
    const templateId = parseDoubleQuotedValue(block, "template_id");
    if (!templateId || templateId === "null") {
      continue;
    }

    rulesByTemplate.set(templateId, {
      id,
      priority: Number.parseInt(parseDoubleQuotedValue(block, "priority") || parseScalarValue(block, "priority"), 10),
      routeTo: parseDoubleQuotedValue(block, "route_to"),
      note: parseDoubleQuotedValue(block, "note") || "",
      manualFollowup: parseIndentedListFromBlock(block, "manual_followup:"),
      matchFields: buildMatchFields(block),
    });
  }

  return rulesByTemplate;
}

function parseRoutingGroups(yamlText) {
  const routes = new Map();
  const section = sliceSection(yamlText, "routing_groups:", "dedupe_policy:");
  const blockRegex = /^  ([A-Z0-9_]+):\n([\s\S]*?)(?=^  [A-Z0-9_]+:\n|$(?![\s\S]))/gm;

  for (const match of section.matchAll(blockRegex)) {
    const id = match[1];
    const block = match[2];
    routes.set(id, {
      id,
      label: ROUTING_LABELS[id] || id,
      mailbox:
        parseDoubleQuotedValue(block, "primary_mailbox") ||
        parseDoubleQuotedValue(block, "public_mailbox") ||
        "",
      handles: parseIndentedListFromBlock(block, "handles:"),
    });
  }

  return routes;
}

function parseExclusionRules(yamlText) {
  const rulesSection = sliceSection(yamlText, "rules:", "manual_flow_norms:");
  const list = [];
  const ruleRegex = /^  - id: "(EX\d+_[^"]+)"\n([\s\S]*?)(?=^  - id: "|$(?![\s\S]))/gm;

  for (const match of rulesSection.matchAll(ruleRegex)) {
    const id = match[1];
    const block = match[2];
    list.push({
      id,
      reason: parseDoubleQuotedValue(block, "reason") || "",
      routeTo: parseDoubleQuotedValue(block, "route_to") || "",
    });
  }

  return list;
}

function parseManualFlowNorms(yamlText) {
  const section = sliceSection(yamlText, "manual_flow_norms:", "");
  return {
    firstTouch: parseSectionList(section, "manual_flow_norms:", "", "  first_touch:"),
    secondTouch: parseSectionList(section, "manual_flow_norms:", "", "  second_touch:"),
    escalation: parseSectionList(section, "manual_flow_norms:", "", "  escalation:"),
    signatureControl: parseSectionList(section, "manual_flow_norms:", "", "  signature_control:"),
    pricingControl: parseSectionList(section, "manual_flow_norms:", "", "  pricing_control:"),
  };
}

function parseDefaultBlocks(markdown) {
  const section = sliceSection(markdown, "## 四、建议维护的默认值", "## 五、落地提醒");
  const matches = [
    ...section.matchAll(
      /- `(\{\{[^`]+\}\})`\s*\n(?:\s*```(?:[^\n`]*)\n([\s\S]*?)\n\s*```|\s*`([\s\S]*?)`)/g,
    ),
  ];
  return matches.map((match) => ({
    token: match[1],
    value: normalizeMultilineValue(match[2] ?? match[3] ?? ""),
  }));
}

function normalizeMultilineValue(input) {
  const value = String(input || "").replace(/\r/g, "");
  const lines = value.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  const commonIndent =
    nonEmptyLines.length > 0
      ? Math.min(...nonEmptyLines.map((line) => (line.match(/^ */) || [""])[0].length))
      : 0;

  return lines
    .map((line) => line.slice(commonIndent))
    .join("\n")
    .trim();
}

function parseSectionList(text, startMarker, endMarker, listKey) {
  const section = sliceSection(text, startMarker, endMarker);
  return parseIndentedListFromBlock(section, listKey);
}

function parseQuotedRulesFromSection(text, startMarker, endMarker) {
  const section = sliceSection(text, startMarker, endMarker);
  return [...section.matchAll(/^\s+rule: "(.+)"$/gm)].map((match) => match[1].trim());
}

function splitEnglishTemplate(rawText) {
  const lines = rawText.trim().split("\n");
  const signoffIndex = lines.findIndex((line) => line.trim() === "Best regards,");
  if (signoffIndex < 0) {
    throw new Error(`English template missing "Best regards," signoff.\n${rawText}`);
  }

  return {
    opening: lines[0].trim(),
    body: lines.slice(2, signoffIndex).join("\n").trim(),
    signature: lines.slice(signoffIndex).join("\n").trim(),
  };
}

function collectVersionPlaceholders(versions) {
  const tokens = new Set();
  Object.values(versions || {}).forEach((version) => {
    const content = [version.subject, version.opening, version.body, version.signature].join("\n");
    const matches = content.match(/\{\{[^}]+\}\}/g) || [];
    matches.forEach((token) => tokens.add(token));
  });
  return Array.from(tokens);
}

function parseMarkdownBullets(block) {
  return block
    .trim()
    .split("\n")
    .map((line) => line.replace(/^- /, "").replace(/`/g, "").trim())
    .filter(Boolean);
}

function parseIndentedListFromBlock(block, listKey) {
  const lines = block.split("\n");
  const startIndex = lines.findIndex((line) => line.trim() === listKey.trim());
  if (startIndex < 0) {
    return [];
  }

  const list = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*-\s/.test(line)) {
      list.push(stripYamlBullet(line));
      continue;
    }
    if (/^\s*$/.test(line)) {
      continue;
    }
    if (/^\s{4,}[A-Za-z0-9_]+:/.test(line)) {
      break;
    }
    if (!/^\s{4,}/.test(line)) {
      break;
    }
  }

  return list;
}

function buildMatchFields(block) {
  const fields = [];
  if (/^\s+folder:/m.test(block)) {
    fields.push("Folder");
  }
  if (/^\s+subject_regex_any:/m.test(block) || /^\s+subject_not_regex:/m.test(block) || /^\s+standardized_subject_in:/m.test(block)) {
    fields.push("Subject");
  }
  if (/^\s+body_regex_any:/m.test(block)) {
    fields.push("Body");
  }
  return fields.join(" / ");
}

function buildRoutingLabel(routeTo, routeGroup) {
  if (!routeGroup) {
    return ROUTING_LABELS[routeTo] || routeTo;
  }

  if (routeGroup.mailbox) {
    return `${routeGroup.label}（${routeGroup.mailbox}）`;
  }

  return routeGroup.label;
}

function normalizeInlineText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function stripYamlBullet(line) {
  return line
    .replace(/^\s*-\s*/, "")
    .replace(/^'/, "")
    .replace(/'$/, "")
    .replace(/^"/, "")
    .replace(/"$/, "")
    .trim();
}

function sliceSection(text, startMarker, endMarker) {
  const startIndex = text.indexOf(startMarker);
  if (startIndex < 0) {
    return "";
  }
  const sliced = text.slice(startIndex);
  if (!endMarker) {
    return sliced;
  }
  const endIndex = sliced.indexOf(endMarker);
  return endIndex < 0 ? sliced : sliced.slice(0, endIndex);
}

function parseSingleQuotedValue(text, key) {
  const regex = new RegExp(`${escapeRegExp(key)}:\\s+"([^"]+)"`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function parseDoubleQuotedValue(text, key) {
  const regex = new RegExp(`${escapeRegExp(key)}:\\s+"([^"]+)"`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function parseScalarValue(text, key) {
  const regex = new RegExp(`${escapeRegExp(key)}:\\s+([^\\n]+)`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
