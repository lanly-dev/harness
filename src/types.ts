// Types for the DeepSeek Harness extension
export interface HarnessModel {
  id: string;
  name: string;
  family?: string;
  contextWindow?: number;
  maxTokens?: number;
  version?: string;
  supportsImages?: boolean;
  supportsTools?: boolean;
}

export interface HarnessChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface HarnessChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta?: {
      role?: string;
      content?: string;
      function_call?: unknown;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

export interface HarnessModelsResponse {
  object?: string;
  data: Array<{
    id: string;
    object: string;
    created: number;
    owned_by: string;
  }>;
}

export interface HarnessConfig {
  url: string;
  model: string;
}

export const DEFAULT_CONFIG: HarnessConfig = {
  url: 'http://localhost:3080',
  model: 'deepseek-chat',
};

export const CONFIG_SECTION = 'deepseekHarness';
