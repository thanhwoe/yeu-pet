import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminOnly } from '@app/decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

const createContext = (
  user: { role: string } | undefined,
  handler: () => void,
): ExecutionContext =>
  ({
    getHandler: () => handler,
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

const getHandler = (controller: object): (() => void) =>
  Object.getOwnPropertyDescriptor(controller, 'handler')?.value as () => void;

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(new Reflector());
  });

  it('allows admin users on AdminOnly routes', () => {
    class TestController {
      @AdminOnly()
      handler() {}
    }

    const context = createContext(
      { role: 'admin' },
      getHandler(TestController.prototype),
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects non-admin users on AdminOnly routes', () => {
    class TestController {
      @AdminOnly()
      handler() {}
    }

    const context = createContext(
      { role: 'user' },
      getHandler(TestController.prototype),
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
