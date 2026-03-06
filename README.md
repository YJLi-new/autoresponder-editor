# AliMail Auto-Reply Template Studio

一个部署在 GitHub Pages 的静态网页，用于可视化编辑 KAT VR 企业邮箱自动回复模板。

## 当前默认内容

- 默认模板已切换到 V2 重整规则体系
- 左侧模板列表共 12 组 `TPL_*` 自动回复模板
- 每组模板保留 `中文 / English` 双版本
- 页面内新增只读 `V2 Rules Baseline` 摘要，展示默认语言、占位符政策、排除规则、去重策略、路由团队与默认信息块
- 占位符按钮已改为仅显示 `Our* / KAT*` 体系变量，不再提供客户侧字段占位符

## 数据来源

默认模板与规则摘要由以下两个源文件生成：

- `/mnt/e/KV/KATVR_邮箱自动回复规则与模板_v2_重新生成/KATVR_企业邮箱自动回复模板_v2_重新生成.md`
- `/mnt/e/KV/KATVR_邮箱自动回复规则与模板_v2_重新生成/KATVR_企业邮箱自动回复规则_v2_重新生成.yaml`

生成脚本：

```bash
node scripts/generate-template-data.mjs \
  "/mnt/e/KV/KATVR_邮箱自动回复规则与模板_v2_重新生成/KATVR_企业邮箱自动回复模板_v2_重新生成.md" \
  "/mnt/e/KV/KATVR_邮箱自动回复规则与模板_v2_重新生成/KATVR_企业邮箱自动回复规则_v2_重新生成.yaml" \
  > data/auto-reply-templates.json
```

## V2 规则约束

- 默认语言：`English`
- 同类模板按双语成组展示，但正文内容已按 V2 规则重写
- 客户字段不再作为模板占位符使用，例如 `{{Name}}`、`{{Qty}}`、`{{Budget}}`、`{{Timeline}}`
- 允许的占位符仅用于展示我方产品、方案、软件、交付、支持与支付安全信息
- 内部非表单邮件、自动回复/退信、我方 campaign 回信、付款安全公告回信默认不触发自动回复
- 旧浏览器模板缓存已通过新存储键淘汰，首次打开会强制加载 V2 默认模板

## 激活方式

阿里邮箱开放平台没有提供可直接写入自动回复正文的公开接口，因此默认使用无插件引导模式：

1. 编辑器保存当前模板
2. 自动复制主题 / 正文 / 完整激活包
3. 打开阿里企业邮箱网页
4. 按页面中的 `无插件激活步骤` 在规则页手动粘贴并保存

`alimail-activator.user.js` 仍保留为高级用法，可选安装，但不再是默认前提。

## 项目结构

- `index.html` 页面结构
- `styles.css` 页面样式
- `app.js` 前端逻辑（密钥校验、模板编辑、规则摘要、无插件激活）
- `data/auto-reply-templates.json` 默认模板与规则摘要数据
- `scripts/generate-template-data.mjs` 由 V2 `md + yaml` 生成站点默认数据
- `scripts/generate-access-config.mjs` 生成访问密钥哈希配置
- `alimail-activator.user.js` 可选的 AliMail 页面自动填写脚本

## 部署

1. 推送仓库到 GitHub
2. 在 `Settings -> Pages` 选择 `GitHub Actions`
3. 推送到 `main` 后等待部署完成
4. 打开 `https://<owner>.github.io/<repo>/`

## 访问密钥

密钥不以明文存储，页面只校验 `data/access-control.json` 的哈希值。更新方式：

```bash
node scripts/generate-access-config.mjs "你的新密钥" > data/access-control.json
```
