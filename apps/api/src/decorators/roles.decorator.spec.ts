import 'reflect-metadata';
import { AdminOnly, ROLES_KEY, Roles } from './roles.decorator';
import { AdminOnly as LegacyAdminOnly } from './admin.decorator';

const getHandler = (controller: object): (() => void) =>
  Object.getOwnPropertyDescriptor(controller, 'handler')?.value as () => void;

const getRolesMetadata = (handler: () => void): string[] | undefined =>
  Reflect.getMetadata(ROLES_KEY, handler) as string[] | undefined;

describe('roles decorators', () => {
  it('stores role metadata for explicit roles', () => {
    class TestController {
      @Roles('admin', 'moderator')
      handler() {}
    }

    const metadata = getRolesMetadata(getHandler(TestController.prototype));

    expect(metadata).toEqual(['admin', 'moderator']);
  });

  it('stores RolesGuard-compatible metadata for AdminOnly', () => {
    class TestController {
      @AdminOnly()
      handler() {}
    }

    const metadata = getRolesMetadata(getHandler(TestController.prototype));

    expect(metadata).toEqual(['admin']);
  });

  it('keeps the legacy admin decorator export compatible', () => {
    class TestController {
      @LegacyAdminOnly()
      handler() {}
    }

    const metadata = getRolesMetadata(getHandler(TestController.prototype));

    expect(metadata).toEqual(['admin']);
  });
});
