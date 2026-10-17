export interface HarnessConfig {
  provider: string;
  model: string;
  baseUrl: string;
}

export const DEFAULT_CONFIG: HarnessConfig = {
  provider: 'deepseek-official',
  model: 'deepseek-v4-flash',
  baseUrl: '',
};

export const CONFIG_SECTION = 'deepseekHarness';
