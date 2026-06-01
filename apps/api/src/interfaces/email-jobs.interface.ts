export const EMAIL_JOBS = {
  SEND_EMAIL: 'send-email',
} as const;

export type EmailJobName = (typeof EMAIL_JOBS)[keyof typeof EMAIL_JOBS];

export interface EmailJobData {
  to: string;
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  context?: Record<string, unknown>;
  accountId?: string;
  bookingId?: string;
}

export interface EmailJobParams extends EmailJobData {
  jobName?: EmailJobName;
}
