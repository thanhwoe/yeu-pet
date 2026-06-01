import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ApiResponseDto,
  MessageResponseDto,
  PaginatedResponseDto,
} from '@app/dto/api-response.dto';

const dataSchema = (model?: Type<unknown>) =>
  model ? { $ref: getSchemaPath(model) } : { type: 'object' };

export function ApiOkWrappedResponse(model?: Type<unknown>) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model ?? MessageResponseDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: dataSchema(model),
            },
          },
        ],
      },
    }),
  );
}

export function ApiCreatedWrappedResponse(model?: Type<unknown>) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model ?? MessageResponseDto),
    ApiCreatedResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: dataSchema(model),
            },
          },
        ],
      },
    }),
  );
}

export function ApiPaginatedResponse(model?: Type<unknown>) {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, model ?? MessageResponseDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: dataSchema(model),
              },
            },
          },
        ],
      },
    }),
  );
}
