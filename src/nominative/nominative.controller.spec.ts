import { Test, TestingModule } from '@nestjs/testing';
import { NominativeController } from './nominative.controller';

describe('NominativeController', () => {
  let controller: NominativeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NominativeController],
    }).compile();

    controller = module.get<NominativeController>(NominativeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
