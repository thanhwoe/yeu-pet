import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseMetaDto {
  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  timestamp: string;
}

export class ApiResponseDto<TData = unknown> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ required: false, example: 'Request completed successfully' })
  message?: string;

  data: TData;

  @ApiProperty({ type: ApiResponseMetaDto })
  meta: ApiResponseMetaDto;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;

  @ApiProperty({ example: true })
  hasNextPage: boolean;
}

export class PaginatedResponseDto<TData = unknown> {
  data: TData[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}
