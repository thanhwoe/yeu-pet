import { OmitType } from '@nestjs/swagger';
import { CreateMedicalRecordDto } from './create-medical-record.dto';

export class CreatePetMedicalRecordDto extends OmitType(
  CreateMedicalRecordDto,
  ['petId'] as const,
) {}
