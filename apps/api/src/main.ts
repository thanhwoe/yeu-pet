import './instrument';

import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { API_ERROR_CODES } from './errors/api-error-codes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  // Global prefix for all routes
  const apiPrefix: string = configService.get<string>('API_PREFIX') ?? 'api';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors();

  const environment: string =
    configService.get<string>('NODE_ENV') ?? 'development';

  const isDevelopment = environment === 'development';

  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: isDevelopment
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"],
            },
          },

      // Prevents clickjacking
      frameguard: { action: 'deny' },

      // Forces HTTPS
      hsts: isDevelopment
        ? false
        : { maxAge: 31536000, includeSubDomains: true, preload: true },

      // Prevents MIME type sniffing
      noSniff: true,

      // Disables X-Powered-By header
      hidePoweredBy: true,

      // Controls referrer info in headers
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

      // Enables XSS filter
      xssFilter: true,

      // Disables DNS prefetching
      dnsPrefetchControl: { allow: false },

      // Prevents IE from opening downloads in site context
      ieNoOpen: true,

      // Blocks site from being loaded in a cross-domain context
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('YeuPet API Document')
    .setDescription('The API documentation for the YeuPet project')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // Global Validation DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        return new BadRequestException({
          errorCode: API_ERROR_CODES.VALIDATION_FAILED,
          messageKey: 'errors.common.validationFailed',
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
