import { Prisma, PrismaClient } from '@app/generated/prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { ITXClientDenyList } from '@prisma/client/runtime/client';

type TransactionClient = Omit<PrismaClient, ITXClientDenyList>;

interface LockRowForUpdateOptions {
  table: string;
  id: string;
  idColumn?: string;
  columns?: string[];
}

const SQL_IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]*$/;

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
    });
    super({
      adapter,
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
      omit: {
        accounts: {
          password_hash: true,
        },
      },
    });

    if (configService.getOrThrow<string>('NODE_ENV') === 'development') {
      this.$on('query' as never, (e: { query: string; duration: number }) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }

  async lockRowForUpdate<T>(
    tx: TransactionClient,
    options: LockRowForUpdateOptions,
  ): Promise<T | null> {
    const table = this.toSqlIdentifier(options.table);
    const idColumn = this.toSqlIdentifier(options.idColumn ?? 'id');
    const columns = this.toSelectList(options.columns);

    const rows = await tx.$queryRaw<T[]>(
      Prisma.sql`
        SELECT ${Prisma.raw(columns)}
        FROM ${Prisma.raw(table)}
        WHERE ${Prisma.raw(idColumn)} = ${options.id}::uuid
        FOR UPDATE
      `,
    );

    return rows[0] ?? null;
  }

  private toSelectList(columns?: string[]): string {
    if (!columns?.length) return '*';

    return columns.map((column) => this.toSqlIdentifier(column)).join(', ');
  }

  private toSqlIdentifier(identifier: string): string {
    if (!SQL_IDENTIFIER_PATTERN.test(identifier)) {
      throw new Error(`Unsafe SQL identifier: ${identifier}`);
    }

    return `"${identifier}"`;
  }
}
