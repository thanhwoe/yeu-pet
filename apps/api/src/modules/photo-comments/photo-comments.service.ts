import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePhotoCommentDto } from './dto/create-photo-comment.dto';
import { PhotoCommentsRepository } from './photo-comments.repository';
import { accounts, photos_status } from '@app/generated/prisma/client';
import { PhotosRepository } from '../photos/photos.repository';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { Action } from '../casl/casl.types';
import { assertAbility } from '../casl/casl.helper';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';

@Injectable()
export class PhotoCommentsService {
  constructor(
    private readonly photoCommentsRepository: PhotoCommentsRepository,
    private readonly photosRepository: PhotosRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async create(
    user: accounts,
    photoId: string,
    createPhotoCommentDto: CreatePhotoCommentDto,
  ) {
    await this.assertPhotoAbility(user, photoId);

    if (createPhotoCommentDto.parentId) {
      await this.assertCommentAbility(
        createPhotoCommentDto.parentId,
        photoId,
        Action.Create,
      );
    }

    return this.photoCommentsRepository.create({
      account_id: user.id,
      content: createPhotoCommentDto.content,
      parent_id: createPhotoCommentDto.parentId,
      photo_id: photoId,
    });
  }

  async findAll(user: accounts, photoId: string, pagination: PaginationDto) {
    await this.assertPhotoAbility(user, photoId);

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.photoCommentsRepository.findAll({
      skip,
      take: limit,
      photo_id: photoId,
    });

    return paginate(data, total, page, limit);
  }

  async findAllReplies(
    user: accounts,
    photoId: string,
    commentId: string,
    pagination: PaginationDto,
  ) {
    await this.assertPhotoAbility(user, photoId);

    await this.assertCommentAbility(commentId, photoId, Action.Read);

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.photoCommentsRepository.findAllReplies({
      skip,
      take: limit,
      photo_id: photoId,
      parent_id: commentId,
    });

    return paginate(data, total, page, limit);
  }

  async remove(user: accounts, id: string, photoId: string) {
    const photo = await this.assertPhotoAbility(user, photoId);

    const comment = await this.assertCommentAbility(id, photoId, Action.Delete);

    // Owner or photo owner can delete
    if (comment.account_id !== user.id && photo?.account_id !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }
    await this.photoCommentsRepository.delete(id);
  }

  private async assertPhotoAbility(user: accounts, id: string) {
    const record = await this.photosRepository.findById(id);

    if (!record) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }

    if (record.status !== photos_status.ready) {
      throw new NotFoundException('Photo not available');
    }

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, Action.Read, 'Photos', record);

    return record;
  }

  private async assertCommentAbility(
    id: string,
    photoId: string,
    action: Action,
  ) {
    const record = await this.photoCommentsRepository.findById(id);

    if (!record || record.photo_id !== photoId) {
      throw new NotFoundException(`Comment not found on this photo`);
    }

    if (record.parent_id && action === Action.Create) {
      throw new BadRequestException(
        'Nested replies beyond 1 level are not supported',
      );
    }

    if (record.deleted_at) {
      const message = {
        [Action.Read]: 'Cannot read a deleted comment',
        [Action.Create]: 'Cannot reply to a deleted comment',
        [Action.Delete]: 'Comment not found',
      };
      throw new BadRequestException(message[action]);
    }

    return record;
  }
}
