import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

export const PostHogClient = Symbol('PostHogClient');

export const posthogFactory = (config: ConfigService) => {
  const apiKey = config.get<string>('POSTHOG_API_KEY');
  if (!apiKey) {
    return null;
  }
  return new PostHog(apiKey, {
    host: config.get<string>('POSTHOG_HOST') ?? 'https://us.i.posthog.com',
  });
};
