import { PrismaService } from '@app/database/prisma/prisma.service';
import { notification_deliveries } from '@app/generated/prisma/client';
import { INotificationDeliveriesRepository } from '@app/interfaces/notification-deliveries-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationDeliveriesRepository implements INotificationDeliveriesRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    data: Omit<notification_deliveries, 'id' | 'created_at' | 'updated_at'>,
  ) {
    return this.prisma.notification_deliveries.create({
      data,
    });
  }

  update(id: string, data: Partial<notification_deliveries>) {
    return this.prisma.notification_deliveries.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
}
