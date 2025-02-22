import { createLLMService, ModelManager } from '@prompt-optimizer/core';
import { expect, describe, it, beforeEach, beforeAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
beforeAll(() => {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
});

describe('自定义模型测试', () => {
  let llmService;
  let modelManager;

  beforeEach(() => {
    localStorage.clear();
    modelManager = new ModelManager();
    llmService = createLLMService(modelManager);
  });

  it('应该能正确加载和使用自定义模型', () => {
    const model = modelManager.getModel('custom');
    
    expect(model).toBeDefined();
    expect(model.name).toBe('Custom');
    
    // 处理环境变量可能为空的情况
    if (process.env.VITE_CUSTOM_API_BASE_URL) {
      expect(model.baseURL).toBe(process.env.VITE_CUSTOM_API_BASE_URL);
    }
    
    if (process.env.VITE_CUSTOM_API_MODEL) {
      expect(model.models).toEqual([process.env.VITE_CUSTOM_API_MODEL]);
      expect(model.defaultModel).toBe(process.env.VITE_CUSTOM_API_MODEL);
    }
    
    expect(model.enabled).toBe(!!process.env.VITE_CUSTOM_API_KEY);
  });

  it('应该能正确处理自定义模型的配置更新', () => {
    const updatedConfig = {
      name: 'Updated Custom Model',
      baseURL: process.env.VITE_CUSTOM_API_BASE_URL || 'https://api.custom.test',
      models: [process.env.VITE_CUSTOM_API_MODEL || 'test-model'],
      defaultModel: process.env.VITE_CUSTOM_API_MODEL || 'test-model',
      enabled: true,
      provider: 'custom'
    };

    modelManager.updateModel('custom', updatedConfig);
    const model = modelManager.getModel('custom');

    expect(model.name).toBe(updatedConfig.name);
    expect(model.baseURL).toBe(updatedConfig.baseURL);
    expect(model.models).toEqual(updatedConfig.models);
    expect(model.defaultModel).toBe(updatedConfig.defaultModel);
  });

  it('应该能正确调用自定义模型的 API', async () => {
    if (!process.env.VITE_CUSTOM_API_KEY) {
      console.log('跳过测试：未设置 VITE_CUSTOM_API_KEY 环境变量');
      return;
    }

    const messages = [
      { role: 'user', content: '你好，请用一句话介绍你自己' }
    ];

    const response = await llmService.sendMessage(messages, 'custom');
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  }, 5000);

  it('应该能正确处理自定义模型的多轮对话', async () => {
    if (!process.env.VITE_CUSTOM_API_KEY) {
      console.log('跳过测试：未设置 VITE_CUSTOM_API_KEY 环境变量');
      return;
    }

    const messages = [
      { role: 'user', content: '你好' },
      { role: 'assistant', content: '你好！有什么我可以帮你的吗？' },
      { role: 'user', content: '再见' }
    ];

    const response = await llmService.sendMessage(messages, 'custom');
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  }, 5000);
}); 