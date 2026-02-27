import { Param, ParseUUIDPipe } from '@nestjs/common';

export function IdParam(param = 'id'): ParameterDecorator {
  return Param(param, new ParseUUIDPipe({ version: '4' }));
}
