import { report_target_type } from '@app/generated/prisma/enums';
import { IModerationRepository } from '@app/interfaces/moderation-repository.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ModerationService } from './moderation.service';

describe('ModerationService', () => {
  const moderationRepository = {
    createReport: jest.fn(),
    findReportsByUser: jest.fn(),
    findTarget: jest.fn(),
    findActiveAccount: jest.fn(),
    upsertBlock: jest.fn(),
    deleteBlock: jest.fn(),
    findBlocksByUser: jest.fn(),
  };

  let service: ModerationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: IModerationRepository, useValue: moderationRepository },
      ],
    }).compile();

    service = moduleRef.get(ModerationService);
  });

  it('creates reports for existing targets owned by another account', async () => {
    moderationRepository.findTarget.mockResolvedValue({
      exists: true,
      ownerAccountId: 'owner-1',
    });
    moderationRepository.createReport.mockResolvedValue({ id: 'report-1' });

    await expect(
      service.createReport({ id: 'account-1' } as never, {
        targetType: report_target_type.sitter,
        targetId: '123e4567-e89b-42d3-a456-426614174000',
        reason: 'unsafe',
      }),
    ).resolves.toEqual({
      reported: true,
      report: { id: 'report-1' },
    });

    expect(moderationRepository.createReport).toHaveBeenCalledWith(
      expect.objectContaining({
        reporter_account_id: 'account-1',
        target_type: report_target_type.sitter,
      }),
    );
  });

  it('rejects missing report targets', async () => {
    moderationRepository.findTarget.mockResolvedValue({ exists: false });

    await expect(
      service.createReport({ id: 'account-1' } as never, {
        targetType: report_target_type.user,
        targetId: '123e4567-e89b-42d3-a456-426614174000',
        reason: 'spam',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects self reports', async () => {
    moderationRepository.findTarget.mockResolvedValue({
      exists: true,
      ownerAccountId: 'account-1',
    });

    await expect(
      service.createReport({ id: 'account-1' } as never, {
        targetType: report_target_type.user,
        targetId: '123e4567-e89b-42d3-a456-426614174000',
        reason: 'spam',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks accounts idempotently after target validation', async () => {
    moderationRepository.findActiveAccount.mockResolvedValue({
      id: 'account-2',
    });
    moderationRepository.upsertBlock.mockResolvedValue({ id: 'block-1' });

    await expect(
      service.blockUser({ id: 'account-1' } as never, 'account-2'),
    ).resolves.toEqual({
      blocked: true,
      block: { id: 'block-1' },
    });
  });

  it('rejects self blocking', async () => {
    await expect(
      service.blockUser({ id: 'account-1' } as never, 'account-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
