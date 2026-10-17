import * as vscode from 'vscode';
import { CONFIG_SECTION } from './types.js';
import { HarnessSettings } from './config.js';
import { HarnessProvider } from './provider.js';
import { HarnessRuntime } from './runtime.js';

const API_KEY_SECRET = 'deepseekHarness.apiKey';
let activeRuntime: HarnessRuntime | undefined;

export function activate(context: vscode.ExtensionContext): void {
  console.log('Activating Harness Provider...');

  const config = HarnessSettings.getConfig();
  activeRuntime = new HarnessRuntime(config, () => context.secrets.get(API_KEY_SECRET));
  const provider = new HarnessProvider(config, activeRuntime);
  const providerRegistration = vscode.lm.registerLanguageModelChatProvider('harness', provider);

  // Add command to configure provider
  const configureCommand = vscode.commands.registerCommand('harness.configureProvider', async () => {
    const currentConfig = HarnessSettings.getConfig();
    const newProvider = await vscode.window.showInputBox({
      prompt: 'Enter a DeepSeek Harness provider ID',
      placeHolder: 'deepseek-official',
      value: currentConfig.provider,
    });

    if (newProvider?.trim()) {
      await HarnessSettings.saveConfig({ provider: newProvider.trim() });
      await provider.updateConfig(HarnessSettings.getConfig());
    }
  });

  const configureModelCommand = vscode.commands.registerCommand('harness.configureModel', async () => {
    const currentConfig = HarnessSettings.getConfig();
    const model = await vscode.window.showInputBox({
      prompt: 'Enter a DeepSeek Harness model ID',
      placeHolder: 'deepseek-v4-flash',
      value: currentConfig.model,
    });

    if (model?.trim()) {
      await HarnessSettings.saveConfig({ model: model.trim() });
      await provider.updateConfig(HarnessSettings.getConfig());
    }
  });

  const configureKeyCommand = vscode.commands.registerCommand('harness.configureApiKey', async () => {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter a DeepSeek API key (leave empty to clear the saved key)',
      password: true,
      ignoreFocusOut: true,
    });

    if (apiKey === undefined) {
      return;
    }

    if (apiKey.trim()) {
      await context.secrets.store(API_KEY_SECRET, apiKey.trim());
    } else {
      await context.secrets.delete(API_KEY_SECRET);
    }
    await provider.updateConfig(HarnessSettings.getConfig());
    vscode.window.showInformationMessage('DeepSeek API key updated.');
  });

  const configListener = vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration(CONFIG_SECTION)) {
      void provider.updateConfig(HarnessSettings.getConfig()).catch(error => {
        vscode.window.showErrorMessage(`Could not restart DeepSeek Harness: ${String(error)}`);
      });
    }
  });

  context.subscriptions.push(
    providerRegistration,
    configureCommand,
    configureModelCommand,
    configureKeyCommand,
    configListener,
    new vscode.Disposable(() => provider.dispose()),
    new vscode.Disposable(() => {
      void activeRuntime?.dispose();
      activeRuntime = undefined;
    }),
  );
}

export async function deactivate(): Promise<void> {
  await activeRuntime?.dispose();
  activeRuntime = undefined;
}

