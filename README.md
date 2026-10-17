---
title: DeepSeek Harness VS Code Extension
description: Use DeepSeek Harness in VS Code Chat through its TypeScript SDK.
---

# DeepSeek Harness for VS Code

This extension registers DeepSeek Harness as a VS Code Chat model provider. It uses DeepSeek's TypeScript SDK to launch a matching Harness runtime as a child process over stdio JSON-RPC. No separate web server or Web Service plugin is required.

## Requirements

- VS Code with an extension-host Node.js runtime of `22.19+` or `24+`.
- A DeepSeek API key, unless the selected provider is configured through another supported credential source.
- Network access to DeepSeek or the Messages-compatible endpoint configured by `deepseekHarness.baseUrl`.

The extension installs the pinned Harness SDK and matching runtime as extension dependencies. Model weights are not included; this default setup uses the hosted DeepSeek API.

## Setup

1. Install and activate the extension.
2. Run **DeepSeek Harness: Configure API Key** from the Command Palette. The key is saved in VS Code Secret Storage, not settings.
3. Select **DeepSeek Harness** from the Chat model picker.

The default provider and model are `deepseek-official` and `deepseek-v4-flash`. Use **DeepSeek Harness: Configure Provider** and **DeepSeek Harness: Configure Model** to change them.

Alternatively, set `DEEPSEEK_API_KEY` in the environment before launching VS Code. For a compatible endpoint, set `deepseekHarness.baseUrl` or `DEEPSEEK_BASE_URL`.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `deepseekHarness.provider` | `deepseek-official` | Harness provider route |
| `deepseekHarness.model` | `deepseek-v4-flash` | Model ID sent to Harness |
| `deepseekHarness.baseUrl` | `""` | Optional Messages-compatible API base URL |

## Behavior

- The SDK starts Harness lazily on the first chat request and reuses the process until the extension is disposed.
- VS Code supplies the conversation history; the extension passes it as a role-labeled transcript because the SDK accepts one prompt per run. Each request starts a fresh Harness session.
- The SDK returns a completed turn rather than token deltas, so the answer appears after the Harness turn finishes rather than streaming token by token.
- Requests go to the configured model provider. This is not an offline local-inference setup and no model weights are bundled.

## Troubleshooting

- **Missing credentials:** run **DeepSeek Harness: Configure API Key** or set `DEEPSEEK_API_KEY` before launching VS Code.
- **Node version error:** update VS Code so its extension host uses Node.js `22.19+` or `24+`.
- **Custom endpoint errors:** confirm `deepseekHarness.baseUrl` points to a DeepSeek Messages-compatible API.
- **Runtime logs:** open **View → Output** and select the extension host output.

## License

The extension is MIT licensed. DeepSeek Harness and its bundled dependencies retain their own licenses; see the [Harness repository notices](https://github.com/deepseek-ai/deepseek-harness/blob/master/THIRD_PARTY_NOTICES.md).
