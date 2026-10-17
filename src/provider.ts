import * as vscode from 'vscode';
import { HarnessConfig } from './types.js';
import { HarnessRuntime } from './runtime.js';

export class HarnessProvider implements vscode.LanguageModelChatProvider {
  private readonly changeEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeLanguageModelChatInformation = this.changeEmitter.event;

  constructor(private config: HarnessConfig, private readonly runtime: HarnessRuntime) {}

  async updateConfig(config: HarnessConfig): Promise<void> {
    this.config = config;
    await this.runtime.configure(config);
    this.changeEmitter.fire();
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }

  async provideLanguageModelChatInformation(): Promise<vscode.LanguageModelChatInformation[]> {
    return [{
      id: this.config.model,
      name: this.config.model,
      family: 'deepseek',
      maxInputTokens: 128000,
      maxOutputTokens: 8192,
      version: '1.0.0',
      capabilities: {
        toolCalling: false,
        imageInput: false,
      },
      tooltip: `DeepSeek Harness (${this.config.provider})`,
    }];
  }

  async provideLanguageModelChatResponse(
    model: vscode.LanguageModelChatInformation,
    messages: readonly vscode.LanguageModelChatMessage[],
    _options: vscode.ProvideLanguageModelChatResponseOptions,
    progress: vscode.Progress<vscode.LanguageModelResponsePart>,
    token: vscode.CancellationToken,
  ): Promise<void> {
    if (token.isCancellationRequested) {
      return;
    }
    const result = await this.runtime.run(this.formatMessages(messages));
    if (!token.isCancellationRequested && result) {
      progress.report(new vscode.LanguageModelTextPart(result));
    }
  }

  private formatMessages(messages: readonly vscode.LanguageModelChatMessage[]): string {
    const transcript = messages.map(message => {
      const role = message.role === vscode.LanguageModelChatMessageRole.User ? 'User' : 'Assistant';
      const content = message.content
        .map(part => part instanceof vscode.LanguageModelTextPart ? part.value : '')
        .join('');
      return `### ${role}\n${content}`;
    }).join('\n\n');

    return `Continue this VS Code chat. Use the labeled transcript as conversation context and answer the latest user message.\n\n${transcript}`;
  }

  async provideTokenCount(model: vscode.LanguageModelChatInformation, text: string | vscode.LanguageModelChatMessage, token: vscode.CancellationToken): Promise<number> {
    // Basic token estimation: ~4 characters per token (English)
    // For more accurate counting, would need to query /tokens endpoint if available
    const textToCount = typeof text === 'string' ? text : text.content.map(part => (part as { value?: string }).value ?? '').join('');
    return Math.ceil(textToCount.length / 4);
  }
}
