import * as vscode from 'vscode';
import { HarnessConfig, HarnessChatRequest, HarnessChatResponse, HarnessModelsResponse, HarnessModel } from './types.js';

export class HarnessHttpClient {
  private baseUrl: string;

  constructor(config: HarnessConfig) {
    this.baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    return headers;
  }

  async chatCompletion(params: HarnessChatRequest): Promise<HarnessChatResponse> {
    const fetchImpl = await this.getNodeFetch();
    const url = `${this.baseUrl}/v1/chat/completions`;
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as HarnessChatResponse;

    if (data.error) {
      throw new Error(`API error: ${JSON.stringify(data.error)}`);
    }

    return data;
  }

  async *chatCompletionStream(params: HarnessChatRequest): AsyncIterable<HarnessChatResponse> {
    const fetchImpl = await this.getNodeFetch();
    const url = `${this.baseUrl}/v1/chat/completions`;
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = (response.body as NodeJS.ReadableStream & { getReader: () => ReadableStreamDefaultReader<Uint8Array> })?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const text = value ? Buffer.from(value).toString('utf-8') : '';
        buffer += text;

        // Process complete lines (SSE format)
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === 'data: [DONE]') {
            return;
          }
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(jsonStr) as HarnessChatResponse;
              if (parsed.choices && parsed.choices[0]?.delta?.content) {
                yield parsed;
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async getModels(): Promise<HarnessModel[]> {
    const fetchImpl = await this.getNodeFetch();
    const url = `${this.baseUrl}/v1/models`;
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as HarnessModelsResponse;
    return data.data.map((model: { id: string; object?: string; created?: number; owned_by?: string }) => ({
      id: model.id,
      name: model.id,
      family: model.object === 'model' ? 'unknown' : 'deepseek',
      contextWindow: 128000, // Default context window
      maxTokens: 8192, // Default max tokens
      supportsImages: false,
      supportsTools: true,
    }));
  }

  async healthCheck(): Promise<boolean> {
    const fetchImpl = await this.getNodeFetch();
    try {
      const response = await fetchImpl(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async getNodeFetch() {
    const nf = await import('node-fetch');
    return nf.default;
  }
}

