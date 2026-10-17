import * as vscode from 'vscode';
import { DEFAULT_CONFIG, HarnessConfig, CONFIG_SECTION } from './types.js';

export class HarnessSettings {
  static getConfig(): HarnessConfig {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return {
      url: config.get<string>('url', DEFAULT_CONFIG.url),
      model: config.get<string>('model', DEFAULT_CONFIG.model),
    };
  }

  static async saveConfig(config: Partial<HarnessConfig>): Promise<void> {
    const current = HarnessSettings.getConfig();
    const updated = { ...current, ...config };
    const vscodeConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
    await vscodeConfig.update('url', updated.url, true);
    await vscodeConfig.update('model', updated.model, true);
    vscode.window.showInformationMessage('DeepSeek Harness settings saved.');
  }

  static async promptForApiKey(): Promise<string | undefined> {
    throw new Error('API key is not supported. This extension does not use API keys.');
  }

  static async validateConfig(): Promise<boolean> {
    const config = HarnessSettings.getConfig();
    if (!config.url) {
      vscode.window.showErrorMessage('DeepSeek Harness URL is not configured.');
      return false;
    }
    return true;
  }

  static getConfigSection(): vscode.ConfigurationTarget {
    return {
      section: CONFIG_SECTION,
      scope: vscode.ConfigurationTarget.Workspace,
      scopeId: 'workspace',
    } as unknown as vscode.ConfigurationTarget;
  }
}
