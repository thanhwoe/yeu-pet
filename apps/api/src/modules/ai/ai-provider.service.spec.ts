import { ConfigService } from '@nestjs/config';
import { AiProviderService } from './ai-provider.service';

describe('AiProviderService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('calls Gemini generateContent when AI_PROVIDER is gemini', async () => {
    let requestBody: {
      contents: { role: string; parts: { text: string }[] }[];
      systemInstruction: { parts: { text: string }[] };
    };
    const fetchMock = jest.fn((_: string, init?: RequestInit) => {
      const body = typeof init?.body === 'string' ? init.body : '{}';
      requestBody = JSON.parse(body) as {
        contents: { role: string; parts: { text: string }[] }[];
        systemInstruction: { parts: { text: string }[] };
      };

      return Promise.resolve({
        json: jest.fn().mockResolvedValue({
          candidates: [
            {
              content: {
                parts: [{ text: 'Gemini pet care response' }],
              },
            },
          ],
          usageMetadata: {
            candidatesTokenCount: 7,
            promptTokenCount: 11,
          },
        }),
        ok: true,
      } as Response);
    });
    global.fetch = fetchMock;

    const service = new AiProviderService({
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          AI_PROVIDER: 'gemini',
          GEMINI_API_KEY: 'gemini-key',
          GEMINI_MODEL: 'gemini-test-model',
        };

        return values[key];
      }),
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          GEMINI_API_KEY: 'gemini-key',
        };

        return values[key];
      }),
    } as unknown as ConfigService);

    const result = await service.generate([
      {
        content: 'System rules',
        role: 'system',
      },
      {
        content: 'Question',
        role: 'user',
      },
      {
        content: 'Previous answer',
        role: 'assistant',
      },
    ]);

    expect(result).toEqual({
      content: 'Gemini pet care response',
      inputTokens: 11,
      model: 'gemini-test-model',
      outputTokens: 7,
      provider: 'gemini',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-test-model:generateContent',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-goog-api-key': 'gemini-key',
        }) as Record<string, string>,
      }),
    );

    expect(requestBody.systemInstruction.parts[0].text).toBe('System rules');
    expect(requestBody.contents).toEqual([
      {
        parts: [{ text: 'Question' }],
        role: 'user',
      },
      {
        parts: [{ text: 'Previous answer' }],
        role: 'model',
      },
    ]);
  });

  it('falls back when selected provider is missing its API key', async () => {
    const service = new AiProviderService({
      get: jest.fn((key: string) =>
        key === 'AI_PROVIDER' ? 'gemini' : undefined,
      ),
    } as unknown as ConfigService);

    const result = await service.generate([
      {
        content: 'My cat vomited once',
        role: 'user',
      },
    ]);

    expect(result.provider).toBe('fallback');
    expect(result.content).toContain('My cat vomited once');
  });
});
