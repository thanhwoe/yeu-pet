import 'reflect-metadata';
import { subject } from '@casl/ability';
import { MODULE_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ROLES_KEY } from './decorators/roles.decorator';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './filters/prisma-exceptions.filter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CustomThrottlerGuard } from './guards/throttler.guard';
import { ErrorLoggingInterceptor } from './interceptors/error-logging.interceptor';
import { HttpCacheInterceptor } from './interceptors/http-cache.interceptor';
import { TrackInterceptor } from './interceptors/track.interceptor';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AuthController } from './modules/auth/auth.controller';
import { CaslAbilityFactory } from './modules/casl/casl-ability.factory';
import { Action } from './modules/casl/casl.types';
import { BudgetModule } from './modules/budget/budget.module';
import { MedicalRecordsController } from './modules/medical-records/medical-records.controller';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { PetsController } from './modules/pets/pets.controller';
import { PetsModule } from './modules/pets/pets.module';
import { PhotosModule } from './modules/photos/photos.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { SitterBookingModule } from './modules/sitter-booking/sitter-booking.module';
import { UsersModule } from './modules/users/users.module';
import { user_role } from './generated/prisma/client';
import { IBudgetCategoriesRepository } from './interfaces/budget-categories-repository.interface';
import { IBudgetTransactionsRepository } from './interfaces/budget-transactions-repository.interface';
import { IBudgetsRepository } from './interfaces/budgets-repository.interface';
import { IMedicalRecordsRepository } from './interfaces/medical-records-repository.interface';
import { IPetSittersRepository } from './interfaces/pet-sitters-repository.interface';
import { IPetsRepository } from './interfaces/pets-repository.interface';
import { IPhotoCommentsRepository } from './interfaces/photo-comments-repository.interface';
import { IPhotoLikesRepository } from './interfaces/photo-likes-repository.interface';
import { IPhotosRepository } from './interfaces/photos-repository.interface';
import { IRemindersRepository } from './interfaces/reminders-repository.interface';
import { ISitterBookingsRepository } from './interfaces/sitter-bookings-repository.interface';
import { ISitterReviewsRepository } from './interfaces/sitter-reviews-repository.interface';
import { IUsersRepository } from './interfaces/users-repository.interface';

interface ProviderRegistration {
  provide?: unknown;
  useClass?: unknown;
}

const getProviders = (): ProviderRegistration[] =>
  Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AppModule) as
    | ProviderRegistration[]
    | [];

const getHandler = (controller: object, name: string): (() => void) =>
  Object.getOwnPropertyDescriptor(controller, name)?.value as () => void;

const getModuleImports = (module: object): unknown[] =>
  (Reflect.getMetadata(MODULE_METADATA.IMPORTS, module) as unknown[]) ?? [];

const getModuleProviders = (module: object): ProviderRegistration[] =>
  Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module) as
    | ProviderRegistration[]
    | [];

const providerTokens = (module: object): unknown[] =>
  getModuleProviders(module)
    .filter((provider) => typeof provider === 'object' && provider !== null)
    .map((provider) => provider.provide);

const isForwardRefImport = (moduleImport: unknown): boolean =>
  typeof moduleImport === 'object' &&
  moduleImport !== null &&
  'forwardRef' in moduleImport;

describe('App architecture wiring', () => {
  it('registers global filters through Nest DI in the expected order', () => {
    const filters = getProviders()
      .filter((provider) => provider.provide === APP_FILTER)
      .map((provider) => provider.useClass);

    expect(filters).toEqual([
      SentryGlobalFilter,
      AllExceptionsFilter,
      PrismaExceptionFilter,
    ]);
  });

  it('registers auth, role, and throttling guards globally', () => {
    const guards = getProviders()
      .filter((provider) => provider.provide === APP_GUARD)
      .map((provider) => provider.useClass);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard, CustomThrottlerGuard]);
  });

  it('keeps HTTP caching opt-in rather than a global interceptor', () => {
    const interceptors = getProviders()
      .filter((provider) => provider.provide === APP_INTERCEPTOR)
      .map((provider) => provider.useClass);

    expect(interceptors).toEqual([ErrorLoggingInterceptor, TrackInterceptor]);
    expect(interceptors).not.toContain(HttpCacheInterceptor);
  });

  it('keeps public and role decorators aligned with their global guards', () => {
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        getHandler(AppController.prototype, 'getHello'),
      ),
    ).toBe(true);

    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getHandler(AuthController.prototype, 'healthCheck'),
      ),
    ).toEqual(['admin']);
  });

  it('keeps pets decoupled from medical records with one-way module imports', () => {
    const petsImports = getModuleImports(PetsModule);
    const medicalRecordsImports = getModuleImports(MedicalRecordsModule);

    expect(petsImports).not.toContain(MedicalRecordsModule);
    expect(petsImports.some(isForwardRefImport)).toBe(false);
    expect(medicalRecordsImports).toContain(PetsModule);
    expect(medicalRecordsImports.some(isForwardRefImport)).toBe(false);
  });

  it('keeps pet medical-record sub-resource routing under MedicalRecordsController', () => {
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        getHandler(MedicalRecordsController.prototype, 'findAllByPet'),
      ),
    ).toBe('pets/:id/medical-records');
    expect(
      getHandler(PetsController.prototype, 'findAllMedicalRecords'),
    ).toBeUndefined();
  });

  it('keeps simple resource ownership out of CASL rules', () => {
    const ability = new CaslAbilityFactory().createForUser({
      id: 'user-1',
      role: user_role.user,
    } as never);

    expect(ability.can(Action.Create, 'Pets')).toBe(true);
    expect(
      ability.can(
        Action.Update,
        subject('Pets', { account_id: 'user-1' }) as never,
      ),
    ).toBe(false);
  });

  it('registers bounded-context repositories behind injectable contracts', () => {
    expect(providerTokens(UsersModule)).toContain(IUsersRepository);
    expect(providerTokens(PetsModule)).toContain(IPetsRepository);
    expect(providerTokens(MedicalRecordsModule)).toContain(
      IMedicalRecordsRepository,
    );
    expect(providerTokens(RemindersModule)).toContain(IRemindersRepository);
    expect(providerTokens(BudgetModule)).toEqual(
      expect.arrayContaining([
        IBudgetCategoriesRepository,
        IBudgetTransactionsRepository,
        IBudgetsRepository,
      ]),
    );
    expect(providerTokens(PhotosModule)).toEqual(
      expect.arrayContaining([
        IPhotoCommentsRepository,
        IPhotoLikesRepository,
        IPhotosRepository,
      ]),
    );
    expect(providerTokens(SitterBookingModule)).toEqual(
      expect.arrayContaining([
        IPetSittersRepository,
        ISitterBookingsRepository,
        ISitterReviewsRepository,
      ]),
    );
  });
});
