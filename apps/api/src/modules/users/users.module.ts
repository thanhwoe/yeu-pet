import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { SharedModule } from '../shared/shared.module';
import { IUsersRepository } from '@app/interfaces/users-repository.interface';
import { MeController } from './me.controller';

@Module({
  controllers: [UsersController, MeController],
  providers: [
    UsersService,
    UsersRepository,
    { provide: IUsersRepository, useExisting: UsersRepository },
  ],
  imports: [SharedModule],
  exports: [UsersService, UsersRepository, IUsersRepository],
})
export class UsersModule {}
