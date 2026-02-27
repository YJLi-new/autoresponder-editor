# AliMail Auto-Reply Template Studio

一个部署在 GitHub Pages 的静态网页，用于可视化编辑阿里邮箱自动回复模板。

## 功能

- 模板列表管理（新建、删除、导入、导出）
- 可视化字段编辑（主题、正文、生效时间、发送范围）
- 变量插入（`{{sender_name}}` 等）
- 实时预览与一键复制
- 自定义密钥门禁（PBKDF2 哈希校验）
- 本地缓存（浏览器 `localStorage`）

## 项目结构

- `index.html` 页面结构
- `styles.css` 页面样式
- `app.js` 前端逻辑（密钥校验 + 编辑器）
- `data/auto-reply-templates.json` 默认模板
- `data/access-control.json` 访问密钥哈希配置
- `scripts/generate-access-config.mjs` 生成密钥哈希配置
- `.github/workflows/deploy-pages.yml` GitHub Pages 自动部署

## 快速部署

1. 创建或使用现有 GitHub 仓库。
2. 上传本目录文件到仓库根目录。
3. 在 `Settings -> Pages` 选择 `GitHub Actions`。
4. 推送到 `main` 后等待部署完成。
5. 打开 `https://<owner>.github.io/<repo>/`。

## 默认密钥

首次默认密钥是：`ChangeThisNow!2026`

建议你部署后立即修改，避免使用默认密钥。

## 只通过 GitHub 修改密钥

密钥不以明文存储，页面只校验 `data/access-control.json` 的哈希值。要更新密钥：

1. 在本地运行：

```bash
node scripts/generate-access-config.mjs "你的新强密钥"
```

2. 把输出内容覆盖到 `data/access-control.json`。
3. 提交并推送到 GitHub（需要仓库写权限）。
4. Pages 部署完成后，新密钥生效。

## 阿里邮箱使用方式

1. 在编辑器完成模板。
2. 点击“复制纯文本”或“复制 HTML”。
3. 登录阿里邮箱自动回复设置，粘贴主题与正文并启用。

## 注意事项

- 该方案是前端静态门禁，适合业务访问控制，不适合高对抗安全场景。
- 请务必使用高强度密钥（建议 20+ 位，包含大小写、数字、符号）。
- 若你需要“页面级强访问控制”，建议在 Pages 前增加 Cloudflare Access 等网关。
