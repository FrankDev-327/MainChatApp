import { K6testingGuard } from './k6testing.guard';

describe('K6testingGuard', () => {
  it('should be defined', () => {
    expect(new K6testingGuard()).toBeDefined();
  });
});
