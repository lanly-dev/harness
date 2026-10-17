import * as vscode from 'vscode';
import { HarnessConfig, HarnessModel, HarnessChatRequest } from './types.js';
import { HarnessHttpClient } from './http.js';

export class HarnessProvider implements vscode.LanguageModelChatProvider {
  private config: HarnessConfig;
  private httpClient: HarnessHttpClient;

  constructor(config: HarnessConfig, httpClient: HarnessHttpClient) {
    this.config = config;
    this.httpClient = httpClient;
  }

  async provideLanguageModelChatInformation(): Promise<vscode.LanguageModelChatInformation[]> {
    try {
      const models = await this.httpClient.getModels();
      const uniqueModels = new Map<string, HarnessModel>();

      for (const model of models) {
        if (!uniqueModels.has(model.id)) {
          uniqueModels.set(model.id, model);
        }
      }

      return Array.from(uniqueModels.values()).map(model => this.mapToLanguageModelInfo(model));
    } catch (error) {
      // Fallback: return default model if API call fails
      return [{
        id: this.config.model,
        name: this.config.model,
        family: 'unknown',
        version: '1.0.0',
        maxInputTokens: 128000,
        maxOutputTokens: 8192,
        capabilities: {
          toolCalling: true,
          imageInput: false,
        },
      }];
    }
  }

  private mapToLanguageModelInfo(model: HarnessModel): vscode.LanguageModelChatInformation {
    return {
      id: model.id,
      name: model.name,
      family: model.family || 'unknown',
      maxInputTokens: model.contextWindow || 128000,
      maxOutputTokens: model.maxTokens || 8192,
      version: '1.0.0',
      capabilities: {
        toolCalling: model.supportsTools || false,
        imageInput: model.supportsImages || false,
      },
      tooltip: `Harness model: ${model.name}`,
    };
  }

  async provideLanguageModelChatResponse(
    model: vscode.LanguageModelChatInformation,
    messages: readonly vscode.LanguageModelChatMessage[],
    _options: vscode.ProvideLanguageModelChatResponseOptions,
    progress: vscode.Progress<vscode.LanguageModelResponsePart>,
    token: vscode.CancellationToken,
  ): Promise<void> {
    // Convert VS Code messages to OpenAI format
    const openaiMessages = this.convertMessages(messages);

    // Send request to the harness
    const response = await this.httpClient.chatCompletionStream({
      model: model.id,
      messages: openaiMessages,
      stream: true,
      temperature: 0.7,
      maxTokens: 4096,
    });

    for await (const chunk of response) {
      if (token.isCancellationRequested) {
        return;
      }

      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        progress.report(new vscode.LanguageModelTextPart(content));
      }
    }
  }

  private convertMessages(messages: readonly vscode.LanguageModelChatMessage[]): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    return messages.map(msg => {
      if (msg.content instanceof vscode.LanguageModelTextPart) {
        const role = msg.role === vscode.LanguageModelChatMessageRole.User ? 'user' : 'assistant';
        return {
          role: role as 'system' | 'user' | 'assistant',
          content: msg.content.value,
        };
      }
      return {
        role: 'assistant' as 'system' | 'user' | 'assistant',
        content: '',
      };
    });
  }

  async provideTokenCount(model: vscode.LanguageModelChatInformation, text: string | vscode.LanguageModelChatMessage, token: vscode.CancellationToken): Promise<number> {
    // Basic token estimation: ~4 characters per token (English)
    // For more accurate counting, would need to query /tokens endpoint if available
    const textToCount = typeof text === 'string' ? text : text.content.map(part => (part as { value?: string }).value ?? '').join('');
    return Math.ceil(textToCount.length / 4);
  }
}
