# NapCat Bilibili 助手

这是一个基于 NapCat WebSocket 的 QQ 机器人，集成了 Bilibili 链接解析、自动生成预览图、AI 聊天回复、扫码登录以及用户动态/直播订阅功能。

## 功能特性

1.  **B站链接自动解析**：
    *   识别视频 (BV/av)、番剧 (ss/ep)、动态 (t.bilibili.com) 等链接。
    *   自动调用 B站 API 获取标题、封面、播放量、点赞、追番数、评分等信息。
    *   使用 Puppeteer 生成精美的**内容预览图**并发送。
2.  **智能 AI 回复**：
    *   支持通过 `@机器人` 触发。
    *   支持设定自定义概率随机触发。
    *   支持在 `.env` 中自定义 **系统提示词 (System Prompt)** 设定机器人人设。
3.  **B站账号管理**：
    *   支持通过 QQ 指令 `/login` 获取登录二维码。
    *   支持 `/check <key>` 验证登录状态并自动保存 Cookies，用于获取更高权限的数据。
4.  **订阅通知**：
    *   支持 `/sub <uid> dynamic` 订阅用户动态。
    *   支持 `/sub <uid> live` 订阅用户直播状态。
    *   后台自动轮询，并在群内推送更新。

## 项目结构

*   `src/bot.js`: 项目入口，处理 WebSocket 连接。
*   `src/handlers/`: 逻辑处理器（消息处理、AI 回复等）。
*   `src/services/`: 服务层（B站 API 桥接、图片生成、订阅服务）。
*   `src/services/bili_service.py`: 核心 Python 脚本，负责与 `bilibili-api-python` 交互。
*   `setup.sh`: 环境一键配置脚本。

## 快速开始

### 1. 准备工作

*   安装 **Node.js** (v16+)
*   安装 **Python 3.8+**
*   部署并运行 [NapCat](https://github.com/NapCat-Tools/NapCat-QQ)，并开启 **正向 WebSocket 服务**。

### 2. 安装与配置

```bash
# 克隆项目 (或进入目录)
cd napcat-qq-bot

# 运行安装脚本 (会自动创建 venv 并安装所有依赖)
chmod +x setup.sh
./setup.sh

# 配置文件
cp .env.example .env
# 编辑 .env 文件，填入你的 WebSocket 地址和 AI 配置
nano .env
```

### 3. 运行

```bash
npm start
```

## 常用指令

*   **登录**：发送 `/login` 获取二维码，手机扫描后发送 `/check <key>`。
*   **订阅**：发送 `/sub <UID> dynamic` 或 `/sub <UID> live`。
*   **AI 聊天**：直接在群内 @机器人，或者根据设定的概率随机触发。
*   **链接解析**：直接粘贴 B站视频/番剧/动态链接，机器人会自动识别。

## 部署说明

*   **本地 (macOS)**：按照上述步骤即可。
*   **服务器 (Ubuntu)**：
    *   确保服务器已安装 `chromium-browser` 或 Puppeteer 所需的依赖库。
    *   如果遇到 Puppeteer 无法启动，请参考 `src/services/imageGenerator.js` 中的 `args` 配置。

## 免责声明

本工具仅用于学习交流，请勿用于非法用途。Bilibili 相关接口由 `bilibili-api-python` 提供，请遵守 B 站相关规定。
