import {
  applyDecorators,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

export function FileUploaded(options?: {
  required?: boolean;
  maxSize?: number;
  fileTypes?: RegExp;
}): ParameterDecorator {
  const required = options?.required ?? false;
  const maxSize = options?.maxSize ?? 5 * 1024 * 1024; // 5MB
  const fileTypes = options?.fileTypes ?? /(jpg|jpeg|png|webp)$/;

  // @ts-expect-error - TypeScript complains about the decorator type here, but everything works
  return applyDecorators(
    // @ts-expect-error issue: https://github.com/nestjs/nest/issues/16291
    UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize }),
          new FileTypeValidator({ fileType: fileTypes }),
        ],
        fileIsRequired: required,
      }),
    ),
  );
}
