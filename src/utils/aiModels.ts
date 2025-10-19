// AI Model definitions and routing logic
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: 'fast' | 'long-form' | 'specialized' | 'tts' | 'transcription';
  latency: number; // ms
  health: number; // 0-100
  maxTokens: number;
  rpm: number;
  tpm: number;
}

export const AI_MODELS: AIModel[] = [
  // High-Throughput / Fast-Response
  {
    id: 'allam-2-7b',
    name: 'Allam 2 7B',
    provider: 'Groq',
    category: 'fast',
    latency: 50,
    health: 98,
    maxTokens: 6000,
    rpm: 30,
    tpm: 6000,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'LLaMA 3.1 8B Instant',
    provider: 'Groq',
    category: 'fast',
    latency: 45,
    health: 99,
    maxTokens: 6000,
    rpm: 30,
    tpm: 6000,
  },
  {
    id: 'meta-llama/llama-guard-4-12b',
    name: 'LLaMA Guard 4 12B',
    provider: 'Meta',
    category: 'specialized',
    latency: 60,
    health: 97,
    maxTokens: 15000,
    rpm: 30,
    tpm: 15000,
  },
  
  // High-Token / Long-Form
  {
    id: 'llama-3.3-70b-versatile',
    name: 'LLaMA 3.3 70B',
    provider: 'Groq',
    category: 'long-form',
    latency: 120,
    health: 96,
    maxTokens: 12000,
    rpm: 30,
    tpm: 12000,
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'LLaMA 4 Scout 17B',
    provider: 'Meta',
    category: 'long-form',
    latency: 100,
    health: 95,
    maxTokens: 30000,
    rpm: 30,
    tpm: 30000,
  },
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    name: 'LLaMA 4 Maverick 17B',
    provider: 'Meta',
    category: 'long-form',
    latency: 110,
    health: 94,
    maxTokens: 6000,
    rpm: 30,
    tpm: 6000,
  },
  {
    id: 'moonshotai/kimi-k2-instruct',
    name: 'Kimi K2 Instruct',
    provider: 'MoonshotAI',
    category: 'long-form',
    latency: 130,
    health: 93,
    maxTokens: 10000,
    rpm: 60,
    tpm: 10000,
  },
  
  // Specialized
  {
    id: 'groq/compound',
    name: 'Groq Compound',
    provider: 'Groq',
    category: 'specialized',
    latency: 80,
    health: 96,
    maxTokens: 70000,
    rpm: 30,
    tpm: 70000,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'OpenAI',
    category: 'specialized',
    latency: 90,
    health: 95,
    maxTokens: 8000,
    rpm: 30,
    tpm: 8000,
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    provider: 'OpenAI',
    category: 'long-form',
    latency: 150,
    health: 92,
    maxTokens: 8000,
    rpm: 30,
    tpm: 8000,
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen 3 32B',
    provider: 'Qwen',
    category: 'long-form',
    latency: 100,
    health: 94,
    maxTokens: 6000,
    rpm: 60,
    tpm: 6000,
  },
];

export const selectBestModel = (promptType: 'creative' | 'technical' | 'quick' | 'long'): AIModel => {
  let candidates: AIModel[] = [];
  
  switch (promptType) {
    case 'quick':
      candidates = AI_MODELS.filter(m => m.category === 'fast');
      break;
    case 'long':
      candidates = AI_MODELS.filter(m => m.category === 'long-form');
      break;
    case 'technical':
      candidates = AI_MODELS.filter(m => m.category === 'specialized' || m.category === 'long-form');
      break;
    case 'creative':
      candidates = AI_MODELS.filter(m => m.category === 'long-form');
      break;
    default:
      candidates = AI_MODELS;
  }
  
  // Score models by latency and health
  candidates.sort((a, b) => {
    const scoreA = (a.health / 100) * 0.6 - (a.latency / 1000) * 0.4;
    const scoreB = (b.health / 100) * 0.6 - (b.latency / 1000) * 0.4;
    return scoreB - scoreA;
  });
  
  return candidates[0] || AI_MODELS[0];
};

export const classifyPrompt = (prompt: string): 'creative' | 'technical' | 'quick' | 'long' => {
  const lower = prompt.toLowerCase();
  
  if (prompt.length < 20) return 'quick';
  if (prompt.length > 200) return 'long';
  
  const technicalKeywords = ['code', 'debug', 'error', 'function', 'api', 'database', 'algorithm'];
  const creativeKeywords = ['story', 'poem', 'creative', 'imagine', 'design', 'art'];
  
  const hasTechnical = technicalKeywords.some(kw => lower.includes(kw));
  const hasCreative = creativeKeywords.some(kw => lower.includes(kw));
  
  if (hasTechnical) return 'technical';
  if (hasCreative) return 'creative';
  
  return prompt.length > 100 ? 'long' : 'quick';
};
