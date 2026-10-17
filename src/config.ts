import * as vscode from 'vscode';
import { DEFAULT_CONFIG, HarnessConfig, CONFIG_SECTION } from './types.js';

export class HarnessSettings {
  static getConfig(): HarnessConfig {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return {
      provider: config.get<string>('provider', DEFAULT_CONFIG.provider),
      model: config.get<string>('model', DEFAULT_CONFIG.model),
      baseUrl: config.get<string>('baseUrl', DEFAULT_CONFIG.baseUrl),
    };
  }

  static async saveConfig(config: Partial<HarnessConfig>): Promise<void> {
    const current = HarnessSettings.getConfig();
    const updated = { ...current, ...config };
    const vscodeConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
    for (const key of Object.keys(config) as Array<keyof HarnessConfig>) {
      await vscodeConfig.update(key, updated[key], true);
    }
    vscode.window.showInformationMessage('DeepSeek Harness settings saved.');
  }

  static async validateConfig(): Promise<boolean> {
    const config = HarnessSettings.getConfig();
    if (!config.provider || !config.model) {
      vscode.window.showErrorMessage('DeepSeek Harness provider and model must be configured.');
      return false;
    }
    return true;
  }
}
