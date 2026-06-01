import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let queryRaw: jest.Mock;

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'DATABASE_URL') {
          return 'postgresql://user:password@localhost:5432/yeu_pet_test';
        }

        if (key === 'NODE_ENV') {
          return 'test';
        }

        throw new Error(`Missing config: ${key}`);
      }),
    } as unknown as ConfigService;

    queryRaw = jest.fn(() =>
      Promise.resolve([
        {
          id: 'sitter-1',
          active_bookings_count: 1,
          max_concurrent_bookings: 3,
        },
      ]),
    );

    service = new PrismaService(configService);
  });

  const transactionClient = (): Parameters<
    PrismaService['lockRowForUpdate']
  >[0] =>
    ({
      $queryRaw: queryRaw,
    }) as unknown as Parameters<PrismaService['lockRowForUpdate']>[0];

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('locks a row inside the provided transaction client', async () => {
    const result = await service.lockRowForUpdate<{
      id: string;
      active_bookings_count: number;
      max_concurrent_bookings: number;
    }>(transactionClient(), {
      table: 'pet_sitters',
      id: 'sitter-1',
      columns: ['id', 'active_bookings_count', 'max_concurrent_bookings'],
    });

    expect(result).toEqual({
      id: 'sitter-1',
      active_bookings_count: 1,
      max_concurrent_bookings: 3,
    });
    expect(queryRaw.mock.calls).toHaveLength(1);
  });

  it('returns null when no locked row is found', async () => {
    queryRaw.mockReturnValueOnce(Promise.resolve([]));

    const result = await service.lockRowForUpdate(transactionClient(), {
      table: 'pet_sitters',
      id: 'missing-sitter',
    });

    expect(result).toBeNull();
  });

  it('rejects unsafe table and column identifiers before querying', async () => {
    await expect(
      service.lockRowForUpdate(transactionClient(), {
        table: 'pet_sitters; drop table accounts',
        id: 'sitter-1',
      }),
    ).rejects.toThrow('Unsafe SQL identifier');

    expect(queryRaw.mock.calls).toHaveLength(0);
  });
});
