import { PaginationPipe } from '@app/pipes/pagination.pipe';
import { Query } from '@nestjs/common';

export function PaginationQuery(): ParameterDecorator {
  return Query(PaginationPipe);
}
