import { CheckUserRightsGuard } from './check.user.rights.guard';

describe('CheckUserRightsGuard', () => {
  it('should be defined', () => {
    expect(new CheckUserRightsGuard()).toBeDefined();
  });
});
