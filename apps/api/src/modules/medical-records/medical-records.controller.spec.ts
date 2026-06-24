import { CACHE_EVICT_PATTERNS_KEY } from '@app/constants/cache.constants';
import { MedicalRecordsController } from './medical-records.controller';

describe('MedicalRecordsController cache invalidation', () => {
  it.each([
    'create',
    'createForPet',
    'update',
    'remove',
    'addAttachments',
    'removeAttachment',
  ])('evicts cached medical-record lists after %s', (methodName) => {
    const handler = Object.getOwnPropertyDescriptor(
      MedicalRecordsController.prototype,
      methodName,
    )?.value as object | undefined;

    if (!handler) {
      throw new Error(`Missing ${methodName} handler`);
    }

    expect(Reflect.getMetadata(CACHE_EVICT_PATTERNS_KEY, handler)).toEqual([]);
  });
});
