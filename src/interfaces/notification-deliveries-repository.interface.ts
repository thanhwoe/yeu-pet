import { notification_deliveries } from '@app/generated/prisma/client';

export interface INotificationDeliveriesRepository {
  create(
    data: Omit<notification_deliveries, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<notification_deliveries>;
  update(
    id: string,
    data: Partial<notification_deliveries>,
  ): Promise<notification_deliveries>;
}
