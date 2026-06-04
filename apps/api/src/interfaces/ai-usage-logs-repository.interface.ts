export const IAiUsageLogsRepository = Symbol('IAiUsageLogsRepository');

export interface IAiUsageLogsRepository {
  create(data: {
    account_id: string;
    conversation_id?: string | null;
    provider: string;
    model: string;
    input_tokens?: number;
    output_tokens?: number;
  }): Promise<void>;
}
