# 推箱子游戏 Cloudflare Pages 部署教程

本教程将指导您如何将推箱子游戏部署到 Cloudflare Pages，让您的游戏可以在全球范围内快速访问。

## 前提条件

1. 一个 Cloudflare 账号（如果没有，请先在 [Cloudflare 官网](https://www.cloudflare.com/) 注册）
2. 一个 GitHub 账号（用于存储源代码）
3. Git 基础知识

## 步骤 1: 准备源代码仓库

1. 登录您的 GitHub 账号
2. 创建一个新的仓库，例如 `sokoban-game`
3. 将本项目的源代码上传到该仓库

```bash
# 在本地初始化 Git 仓库
cd /path/to/sokoban-game
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库并推送
git remote add origin https://github.com/您的用户名/sokoban-game.git
git push -u origin main
```

## 步骤 2: 登录 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 使用您的账号登录
3. 在左侧菜单中，点击 "Pages"

## 步骤 3: 创建新的 Pages 项目

1. 在 Pages 页面，点击 "创建应用程序" 按钮
2. 选择 "连接到 Git" 选项
3. 选择 GitHub 作为您的 Git 提供商
4. 如果这是您第一次使用 Cloudflare Pages 与 GitHub 集成，您需要授权 Cloudflare 访问您的 GitHub 账号
5. 在仓库列表中，找到并选择您刚刚创建的 `sokoban-game` 仓库
6. 点击 "开始设置" 按钮

## 步骤 4: 配置构建设置

在构建设置页面，填写以下信息：

1. **项目名称**: `sokoban-game`（或您喜欢的任何名称）
2. **生产分支**: `main`（或您的主分支名称）
3. **构建设置**:
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **根目录**: `/`（保持默认）

4. **环境变量**（可选）:
   - 如果您的项目需要任何环境变量，可以在这里添加

5. 点击 "保存并部署" 按钮

## 步骤 5: 等待部署完成

Cloudflare Pages 将开始构建和部署您的应用程序。这个过程通常需要几分钟时间。您可以在 Cloudflare Dashboard 中查看部署进度。

## 步骤 6: 访问您的网站

部署完成后，Cloudflare Pages 将提供一个默认域名，格式为 `项目名称.pages.dev`。您可以通过这个域名访问您的推箱子游戏。

例如: `sokoban-game.pages.dev`

## 步骤 7: 自定义域名（可选）

如果您想使用自己的域名，可以按照以下步骤操作：

1. 在项目页面，点击 "自定义域" 选项卡
2. 点击 "设置自定义域" 按钮
3. 输入您想使用的域名，例如 `sokoban.yourdomain.com`
4. 按照 Cloudflare 提供的说明配置 DNS 记录
5. 等待 DNS 传播完成（可能需要几分钟到几小时）

## 步骤 8: 持续部署

Cloudflare Pages 支持持续部署。每当您推送新的代码到 GitHub 仓库的主分支时，Cloudflare Pages 将自动重新构建和部署您的应用程序。

## 故障排除

如果您在部署过程中遇到问题，请检查以下几点：

1. **构建失败**:
   - 检查构建命令和输出目录是否正确
   - 查看构建日志以获取详细错误信息
   - 确保您的 `package.json` 文件中包含正确的构建脚本

2. **页面加载问题**:
   - 检查浏览器控制台是否有错误
   - 确保所有资源路径都是相对路径
   - 如果使用路由，确保配置了正确的重定向规则

3. **自定义域名问题**:
   - 确保 DNS 记录配置正确
   - 检查 SSL/TLS 证书是否已正确颁发

## 优化提示

1. **启用自动压缩**:
   - Cloudflare Pages 默认会压缩您的资源，但您可以在构建过程中进一步优化

2. **使用缓存控制**:
   - 在 `_headers` 文件中设置适当的缓存控制头，以提高性能

3. **配置预渲染**:
   - 对于静态内容，考虑使用预渲染来提高加载速度

## 结论

恭喜！您已成功将推箱子游戏部署到 Cloudflare Pages。现在，全球各地的用户都可以访问并享受您的游戏了。

如果您有任何问题或需要进一步的帮助，请参考 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)。

祝您游戏愉快！
