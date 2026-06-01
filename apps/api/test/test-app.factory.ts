import {
  type DynamicModule,
  type INestApplication,
  type InjectionToken,
  type Provider,
  type Type,
  ValidationPipe,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

type ModuleImport = Type<unknown> | DynamicModule | Promise<DynamicModule>;

export interface ProviderOverride {
  provide: InjectionToken;
  useValue: unknown;
}

export interface TestModuleOptions {
  imports?: ModuleImport[];
  controllers?: Type<unknown>[];
  providers?: Provider[];
  overrides?: ProviderOverride[];
}

export interface TestAppContext {
  app: INestApplication;
  module: TestingModule;
}

export async function createTestModule(
  options: TestModuleOptions = {},
): Promise<TestingModule> {
  const builder = Test.createTestingModule({
    imports: options.imports ?? [],
    controllers: options.controllers ?? [],
    providers: options.providers ?? [],
  });

  for (const override of options.overrides ?? []) {
    builder.overrideProvider(override.provide).useValue(override.useValue);
  }

  return builder.compile();
}

export async function createTestApp(
  options: TestModuleOptions = {},
): Promise<TestAppContext> {
  const module = await createTestModule(options);
  const app = module.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return { app, module };
}
