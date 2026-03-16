import { PrismaService } from '@app/database/prisma/prisma.service';
import {
  sitter_reviewsCreateInput,
  sitter_reviewsWhereInput,
} from '@app/generated/prisma/models';
import { ISitterReviewsRepository } from '@app/interfaces/sitter-reviews-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SitterReviewsRepository implements ISitterReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(data: sitter_reviewsCreateInput) {
    return this.prisma.sitter_reviews.create({
      data,
    });
  }
  findAll(params?: { skip?: number; take?: number; sitter_id: string }) {
    const where: sitter_reviewsWhereInput = {
      sitter_id: params?.sitter_id,
    };

    return this.prisma.$transaction([
      this.prisma.sitter_reviews.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
        include: {
          accounts: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
          sitter_bookings: {
            select: {
              start_time: true,
              end_time: true,
              type: true,
            },
          },
        },
      }),
      this.prisma.sitter_reviews.count({ where }),
    ]);
  }

  findByBooking(id: string) {
    return this.prisma.sitter_reviews.findUnique({
      where: {
        booking_id: id,
      },
    });
  }
}
