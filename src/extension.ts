import * as vscode from 'vscode';
import { HarnessConfig, HarnessModel, HarnessChatRequest } from './types.js';
import { HarnessSettings } from './config.js';
import { HarnessProvider } from './provider.js';
import { HarnessHttpClient } from './http.js';

export function activate(context: vscode.ExtensionContext): void {
  console.log('Activating Harness Provider...');

  // Get configuration
  const config = HarnessSettings.getConfig();

  // Validate and prompt for API key if needed
  HarnessSettings.validateConfig().then(async (valid: boolean) => {
    if (!valid) {
      await HarnessSettings.promptForApiKey();
    }
  });

  // Create HTTP client
  const httpClient = new HarnessHttpClient(config);

  // Test connection
  httpClient.healthCheck().then(async (healthy: boolean) => {
    if (healthy) {
      console.log('Connected to Harness at', config.url);
    } else {
      console.warn('Could not connect to Harness at', config.url);
      vscode.window.showWarningMessage(
        `Cannot connect to Harness at ${config.url}. ` +
        'Please ensure the server is running.'
      );
    }
  });

  // Create provider
  const provider = new HarnessProvider(config, httpClient);

  // Register the provider
  const providerRegistration = vscode.lm.registerLanguageModelChatProvider('harness', provider);

  // Add command to configure provider
  const configureCommand = vscode.commands.registerCommand('harness.configureProvider', async () => {
    const currentConfig = HarnessSettings.getConfig();
    const newUrl = await vscode.window.showInputBox({
      prompt: 'Enter Harness URL',
      placeHolder: 'http://localhost:3080',
      value: currentConfig.url,
    });

    if (newUrl) {
      await HarnessSettings.saveConfig({ url: newUrl });
      // Reload provider with new config
      const newHttpClient = new HarnessHttpClient({ ...config, url: newUrl });
      const newProvider = new HarnessProvider({ ...config, url: newUrl }, newHttpClient);
      vscode.lm.registerLanguageModelChatProvider('harness', newProvider);
      vscode.window.showInformationMessage('Harness URL updated.');
    }
  });

  // Add command to configure API key - not used in this version
  const configureKeyCommand = vscode.commands.registerCommand('harness.configureApiKey', async () => {
    vscode.window.showInformationMessage('API key is not supported in this version.');
  });

  // Register all disposables
  context.subscriptions.push(
    providerRegistration,
    configureCommand,
    configureKeyCommand
  );

  console.log('Harness Provider activated successfully.');
}

export function deactivate(): void {
  console.log('Harness Provider deactivated.');
}

