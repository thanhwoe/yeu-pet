import { Test, TestingModule } from '@nestjs/testing';
import { PhotoCommentsController } from './photo-comments.controller';
import { PhotoCommentsService } from './photo-comments.service';

describe('PhotoCommentsController', () => {
  let controller: PhotoCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotoCommentsController],
      providers: [PhotoCommentsService],
    }).compile();

    controller = module.get<PhotoCommentsController>(PhotoCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
