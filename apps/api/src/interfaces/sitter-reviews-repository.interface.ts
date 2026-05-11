import { sitter_reviews } from '@app/generated/prisma/client';
import { sitter_reviewsCreateInput } from '@app/generated/prisma/models';

export interface ISitterReviewsRepository {
  create(data: sitter_reviewsCreateInput): Promise<sitter_reviews>;
  findAll(params?: {
    skip?: number;
    take?: number;
    sitter_id: string;
  }): Promise<[sitter_reviews[], number]>;
  findByBooking(id: string): Promise<sitter_reviews | null>;
}
