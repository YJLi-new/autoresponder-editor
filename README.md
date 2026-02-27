# AliMail Auto-Reply Template Studio

一个部署在 GitHub Pages 的静态网页，用于可视化编辑阿里邮箱自动回复模板。

## 功能

- 模板按“类别分组”管理（每个类别内置中/英两个版本）
- 侧边栏同类模板内切换 `中文 / English`
- 可视化字段编辑（主题、开场、正文、签名、生效时间、发送范围）
- 基于规则的元信息展示（Rule ID、路由、SLA、关键词、排除条件、占位符）
- 导入 / 导出 JSON
- 自定义密钥门禁（PBKDF2 哈希校验）
- 一键在 AliMail 激活（无插件引导 + 主题/正文/激活包一键复制）
- 本地缓存（浏览器 `localStorage`）

## 初始模板来源

`data/auto-reply-templates.json` 的初始模板基于：

- `instructions/email_rules_keyword_templates.csv`
- `instructions/email_rules_keyword_templates.xlsx`

已覆盖模板库中的 15 个 `Template_ID`，并为每个类别提供中英双语版本。

## 阿里邮箱格式符合性说明

本项目输出用于 AliMail 自动回复时，采用以下格式：

- `subject`: 纯文本主题
- `bodyText`: 纯文本正文（保留换行）
- `bodyHtml`: 与正文等价的 HTML（`<br>` 换行）
- `startAt/endAt`: `YYYY-MM-DDTHH:mm` 本地时间格式
- `scope`: `all | internal | external`

编辑器内置校验：

- 主题不能为空
- 正文不能为空
- 结束时间必须晚于开始时间
- 主题超长、正文超长、占位符未替换会给出警告

## 激活方式说明

阿里邮箱开放平台当前没有提供“自动回复正文/开关”的公开写接口。

官方 OpenAPI 可见的用户设置接口是：

- `/v2/users/{id_or_email}/mailboxSettings`（主要是外发、自动转发等限制项）

因此默认激活流程为“无插件引导模式”：

1. 编辑器点击“一键在 AliMail 激活”
2. 自动复制当前模板内容（主题/正文/完整激活包）并打开阿里企业邮箱页面
3. 按页面给出的步骤在 AliMail 规则里手动粘贴并保存

## 一键激活行为

一键激活会执行以下流程：

1. 保存当前网页模板更改。
2. 要求填写“指定邮箱（企业版账号）”。
3. 选择激活范围：
`仅当前模板`：只激活当前选中的模板。
`全部模板（生成索引并激活当前）`：生成全部模板索引，便于逐条建立规则并激活当前模板。
4. 每次激活都会先弹确认框，要求你确认已完成短信验证码登录后才继续（该选项固定开启，不在页面显示）。
5. 自动展示“无插件激活步骤”，并提供三个复制按钮：
`复制当前主题`、`复制当前正文`、`复制完整激活包`。

说明：
AliMail 同一邮箱同一时刻只能启用一套自动回复内容，因此“全部模板”模式是“生成模板索引 + 人工逐条设置”，不是同时启用全部模板。

## 可选：安装 AliMail 激活器（高级用法）

1. 安装 Tampermonkey（或同类用户脚本插件）
2. 新建脚本并粘贴 `alimail-activator.user.js` 内容
3. 确保脚本匹配域名：
`https://qiye.aliyun.com/*`
`https://mail.aliyun.com/*`

安装后可尝试自动填充页面，但并非默认必需。

## 项目结构

- `index.html` 页面结构
- `styles.css` 页面样式
- `app.js` 前端逻辑（密钥校验 + 分组双语模板编辑器 + 激活载荷）
- `alimail-activator.user.js` AliMail 端自动激活脚本（含指定邮箱检查与固定短信验证码确认门槛）
- `data/auto-reply-templates.json` 默认模板（分组结构）
- `data/access-control.json` 访问密钥哈希配置
- `scripts/generate-access-config.mjs` 生成密钥哈希配置
- `.github/workflows/deploy-pages.yml` GitHub Pages 自动部署

## 快速部署

1. 创建或使用现有 GitHub 仓库。
2. 上传本目录文件到仓库根目录。
3. 在 `Settings -> Pages` 选择 `GitHub Actions`。
4. 推送到 `main` 后等待部署完成。
5. 打开 `https://<owner>.github.io/<repo>/`。

## 只通过 GitHub 修改密钥

密钥不以明文存储，页面只校验 `data/access-control.json` 的哈希值。要更新密钥：

```bash
node scripts/generate-access-config.mjs "你的新强密钥" > data/access-control.json
```

然后提交并推送到 GitHub，Pages 部署完成后新密钥生效。
