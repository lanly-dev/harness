import * as vscode from 'vscode';
import { HarnessConfig } from './types.js';

interface HarnessProcess {
  run(prompt: string): Promise<{ finalResponse: string }>;
  close(): Promise<void>;
}

export class HarnessRuntime {
  private harnessPromise: Promise<HarnessProcess> | undefined;

  constructor(
    private config: HarnessConfig,
    private readonly getApiKey: () => Thenable<string | undefined>,
  ) {}

  async run(prompt: string): Promise<string> {
    const harness = await this.getHarness();
    const result = await harness.run(prompt);
    return result.finalResponse;
  }

  async configure(config: HarnessConfig): Promise<void> {
    this.config = config;
    await this.disposeHarness();
  }

  async dispose(): Promise<void> {
    await this.disposeHarness();
  }

  private getHarness(): Promise<HarnessProcess> {
    this.harnessPromise ??= this.createHarness().catch((error: unknown) => {
      this.harnessPromise = undefined;
      throw error;
    });
    return this.harnessPromise;
  }

  private async createHarness(): Promise<HarnessProcess> {
    const [major, minor] = process.versions.node.split('.').map(Number);
    if (!((major === 22 && minor >= 19) || major >= 24)) {
      throw new Error(`DeepSeek Harness requires Node.js 22.19+ or 24+. This VS Code extension host uses ${process.versions.node}; update VS Code to continue.`);
    }

    const [{ DeepSeekHarness }, { scrubbedParentEnv }] = await Promise.all([
      import('@deepseek-ai/dsh-sdk-client'),
      import('@deepseek-ai/dsh-subprocess'),
    ]);
    const env: NodeJS.ProcessEnv = scrubbedParentEnv();
    const apiKey = await this.getApiKey();
    if (apiKey) {
      env.DEEPSEEK_API_KEY = apiKey;
    }
    if (this.config.baseUrl) {
      env.DEEPSEEK_BASE_URL = this.config.baseUrl;
    }

    const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    return new DeepSeekHarness({
      provider: this.config.provider,
      model: this.config.model,
      env,
      ...(workspace ? { cwd: workspace } : {}),
    });
  }

  private async disposeHarness(): Promise<void> {
    const pendingHarness = this.harnessPromise;
    this.harnessPromise = undefined;
    if (pendingHarness) {
      const harness = await pendingHarness.catch(() => undefined);
      await harness?.close();
    }
  }
}