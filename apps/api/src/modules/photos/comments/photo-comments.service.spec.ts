import { Test, TestingModule } from '@nestjs/testing';
import { PhotoCommentsService } from './photo-comments.service';

describe('PhotoCommentsService', () => {
  let service: PhotoCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotoCommentsService],
    }).compile();

    service = module.get<PhotoCommentsService>(PhotoCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
