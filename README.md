---
readme: written by AI
title: DeepSeek Harness VS Code Extension
description: Connect VS Code chat to a local DeepSeek Harness instance (offline, OpenAI-compatible)
---

# DeepSeek Harness VS Code Extension

A VS Code extension that provides a **custom language model chat provider** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Work completely offline by connecting to a local DeepSeek Harness instance.

## Features

- 🔌 **OpenAI-Compatible**: Connects to DeepSeek Harness's OpenAI-compatible `/v1/chat/completions` endpoint
- 🖥️ **Local & Offline**: No external API calls - everything runs on your machine
- 💬 **Chat Integration**: Use in VS Code Chat panel with model picker
- ⚙️ **Configurable**: Set URL, API key, and model via VS Code settings
- 📊 **Streaming**: Real-time response streaming in chat

Example configuration:

```json
{
  "deepseekHarness.url": "http://localhost:3080",
  "deepseekHarness.model": "deepseek-chat",
  "deepseekHarness.apiKey": "your-api-key-here"
}
```

## Prerequisites

1. **DeepSeek Harness** - Install and run a local instance
2. **Web Service Plugin** (optional but recommended) - Provides OpenAI-compatible API
3. **Node.js 20+** - For development (not required for end users to use the extension)

## Quick Start (for end users)

1. **Install the extension**
   - Clone or download the extension
   - Open in VS Code
   - Press `F5` to open Extension Development Host

2. **Configure the provider**
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run `DeepSeek Harness: Configure Provider URL` to set your local endpoint
   - Run `DeepSeek Harness: Configure API Key` if authentication is required

3. **Start chatting**
   - Open the Chat panel (`Ctrl+Shift+I`)
   - Select `DeepSeek Harness (Local)` from the model picker
   - Start asking questions!

## Setup for Local DeepSeek Harness

### Step 1: Install DeepSeek Harness

```bash
# Clone the repository
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness

# Install dependencies
npm install

# Build
npm run build
```

### Step 2: Install the Web Service Plugin

The Web Service plugin exposes an OpenAI-compatible API for DeepSeek Harness.

```bash
# Install the web service plugin
dsh plugin --profile web add \
  https://github.com/toddpan/dsh-webapi/releases/latest/download/dsh-web-service.tgz
```

> **Note**: You may need to adjust your `dsh-home` configuration depending on how you run DeepSeek Harness.

### Step 3: Start DeepSeek Harness

```bash
# Start the server
npm start
```

By default, the web service runs on `http://localhost:3080`.

### Step 4: Configure VS Code

Open your VS Code settings (JSON) and add:

```json
{
  "deepseekHarness.url": "http://localhost:3080",
  "deepseekHarness.apiKey": "",  // Leave empty if no authentication
  "deepseekHarness.model": "deepseek-chat"
}
```

Or use the command palette:
- `DeepSeek Harness: Configure Provider URL`
- `DeepSeek Harness: Configure API Key`

## Extension Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `deepseekHarness.url` | string | `http://localhost:3080` | URL of the local harness server |
| `deepseekHarness.apiKey` | string | `""` | API key for authentication |
| `deepseekHarness.model` | string | `deepseek-chat` | Default model to use |

## Commands

| Command | Title | Description |
|---------|-------|-------------|
| `harness.configureProvider` | DeepSeek Harness: Configure Provider URL | Set the URL of your local harness server |
| `harness.configureApiKey` | DeepSeek Harness: Configure API Key | Set or update the API key |

## How It Works (Offline Mode)

1. VS Code launches the extension in the Extension Development Host
2. The extension connects to the local DeepSeek Harness at `http://localhost:3080`
3. User selects `DeepSeek Harness (Local)` in the model picker
4. Chat messages are sent to the local server via OpenAI-compatible API
5. Responses stream back in real-time via SSE (Server-Sent Events)

Everything stays on your local machine - no cloud API calls needed!

## Important Notes

- **This extension does NOT run the models itself** - it requires a local DeepSeek Harness instance
- **Model files must be downloaded** separately (e.g., using `huggingface-cli download` or via the Harness UI)
- **Free and open source** - no API costs, works completely offline
- **Personal use only** - please check the license terms for commercial use

## Troubleshooting

### Cannot connect to local server
1. Ensure DeepSeek Harness is running: `curl http://localhost:3080/v1/models`
2. Check the URL in settings - it must match your running instance
3. Look for warnings in the Output panel (`Ctrl+Shift+U` → `DeepSeek Harness Provider`)

### No models appear in picker
- Verify the server has models loaded: `curl http://localhost:3080/v1/models`
- Ensure the server has been running long enough to load models

### API key not working
- Double-check the API key in settings
- Ensure the key has privileges for the models you want to use

## Contributing

Contributions are welcome! Please see the main repository:

- [DeepSeek Harness GitHub](https://github.com/deepseek-ai/deepseek-harness)

## License

This extension is licensed under the MIT License.

- **DeepSeek Harness**: [MIT License](https://github.com/deepseek-ai/deepseek-harness/blob/main/LICENSE.md)
- **Web Service Plugin**: [BSD-3-Clause License](https://github.com/toddpan/dsh-webapi/blob/main/LICENSE)

See individual license files for details.
