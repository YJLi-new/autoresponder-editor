# AliMail Auto-Reply Template Studio

一个可部署在 GitHub Pages 的静态网页，用于可视化编辑阿里邮箱自动回复模板。

## 功能

- 模板列表管理（新建、删除、导入、导出）
- 可视化字段编辑（主题、正文、生效时间、发送范围）
- 变量插入（`{{sender_name}}` 等）
- 实时预览
- GitHub 授权门禁：输入 Token 后校验仓库权限才能进入
- 模板同步：直接写入 GitHub 仓库中的 JSON 文件

## 项目结构

- `index.html` 页面结构
- `styles.css` 页面样式
- `app.js` 前端逻辑（授权 + 编辑 + GitHub API）
- `data/auto-reply-templates.json` 默认模板数据
- `.github/workflows/deploy-pages.yml` GitHub Pages 自动部署

## 快速部署到 GitHub

1. 新建仓库（例如 `autoresponder-editor`）。
2. 把当前目录所有文件上传到仓库根目录。
3. 进入 `Settings -> Pages`，确认 Source 使用 `GitHub Actions`。
4. 推送到 `main` 分支后，等待 `Deploy GitHub Pages` 工作流完成。
5. 获得页面地址：`https://<owner>.github.io/<repo>/`。

## 授权访问策略（必须授权）

### 方案 A（强访问控制，页面级）

如果你要求“网页本身不能被未授权用户打开”，优先使用以下任一方式：

1. GitHub Enterprise Cloud 组织开启 Pages 访问控制（仅组织成员可访问）。
2. GitHub Pages 前面加一层访问网关（如 Cloudflare Access），仅允许指定账号/邮箱访问。

### 方案 B（内置门禁，编辑级）

当前项目已内置 GitHub Token 校验：

1. 创建 `Fine-grained personal access token`。
2. Token 仅授权目标仓库。
3. 权限最小化设置：
   - Repository permissions -> `Contents: Read and write`
4. 打开网页后输入 Token + Owner + Repo，验证通过才可进入编辑器并同步模板。

说明：未持有有权限的 Token 无法读取/写入目标模板文件，页面核心编辑与同步流程无法完成。

## 阿里邮箱使用方式

编辑完成后：

1. 在右侧预览区点击“复制纯文本”或“复制 HTML”。
2. 登录阿里邮箱管理界面，进入自动回复设置。
3. 粘贴主题和正文，并设置启用时间。

## 注意事项

- Token 只保存在浏览器会话（`sessionStorage`），关闭标签页后需要重新输入。
- 模板会缓存到浏览器 `localStorage`，避免意外刷新丢失。
- 若多人协作，建议统一使用同一个仓库 JSON 路径（默认 `data/auto-reply-templates.json`）。
