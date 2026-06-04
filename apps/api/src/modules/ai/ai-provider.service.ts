import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AiProviderMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiProviderResult {
  content: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

interface GeminiGenerateContentResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor(private readonly configService: ConfigService) {}

  async generate(messages: AiProviderMessage[]): Promise<AiProviderResult> {
    const provider =
      this.configService.get<string>('AI_PROVIDER')?.toLowerCase() ??
      'fallback';

    if (
      provider === 'openai' &&
      this.configService.get<string>('OPENAI_API_KEY')
    ) {
      return this.generateOpenAi(messages);
    }

    if (
      provider === 'gemini' &&
      this.configService.get<string>('GEMINI_API_KEY')
    ) {
      return this.generateGemini(messages);
    }

    return this.generateFallback(messages);
  }

  private async generateOpenAi(
    messages: AiProviderMessage[],
  ): Promise<AiProviderResult> {
    const model =
      this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
        };
      };

      return {
        content:
          payload.choices?.[0]?.message?.content?.trim() ??
          this.fallbackContent(),
        provider: 'openai',
        model,
        inputTokens: payload.usage?.prompt_tokens,
        outputTokens: payload.usage?.completion_tokens,
      };
    } catch (error) {
      this.logger.warn(
        `AI provider unavailable, using fallback: ${(error as Error).message}`,
      );

      return this.generateFallback(messages);
    }
  }

  private async generateGemini(
    messages: AiProviderMessage[],
  ): Promise<AiProviderResult> {
    const model =
      this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: this.toGeminiContents(messages),
            systemInstruction: this.toGeminiSystemInstruction(messages),
            generationConfig: {
              temperature: 0.3,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as GeminiGenerateContentResponse;

      return {
        content:
          payload.candidates?.[0]?.content?.parts
            ?.map((part) => part.text)
            .filter((text): text is string => Boolean(text))
            .join('\n')
            .trim() ?? this.fallbackContent(),
        provider: 'gemini',
        model,
        inputTokens: payload.usageMetadata?.promptTokenCount,
        outputTokens: payload.usageMetadata?.candidatesTokenCount,
      };
    } catch (error) {
      this.logger.warn(
        `Gemini provider unavailable, using fallback: ${(error as Error).message}`,
      );

      return this.generateFallback(messages);
    }
  }

  private generateFallback(messages: AiProviderMessage[]): AiProviderResult {
    const userMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'user');

    return {
      content: `${this.fallbackContent()}\n\nI read your question: "${userMessage?.content ?? ''}". Please share your pet's species, age, weight, symptoms, and how long this has been happening so I can help you prepare better questions for your vet.`,
      provider: 'fallback',
      model: 'local-safety-fallback',
      inputTokens: this.estimateTokens(
        messages.map((message) => message.content).join(' '),
      ),
      outputTokens: 80,
    };
  }

  private fallbackContent() {
    return 'I can provide general pet-care information, but I cannot diagnose your pet or replace professional veterinary care.';
  }

  private estimateTokens(content: string) {
    return Math.ceil(content.length / 4);
  }

  private toGeminiContents(messages: AiProviderMessage[]) {
    return messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));
  }

  private toGeminiSystemInstruction(messages: AiProviderMessage[]) {
    const text = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n');

    if (!text) {
      return undefined;
    }

    return {
      parts: [{ text }],
    };
  }
}
