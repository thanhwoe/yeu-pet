import { Module } from '@nestjs/common';
import { PetSittersService } from './pet-sitters.service';
import { PetSittersController } from './pet-sitters.controller';
import { PetSittersRepository } from './pet-sitters.repository';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [CaslModule],
  controllers: [PetSittersController],
  providers: [PetSittersService, PetSittersRepository],
  exports: [PetSittersRepository],
})
export class PetSittersModule {}
