import { Test, TestingModule } from '@nestjs/testing';
import { PrometheusChatappController } from './prometheus-chatapp.controller';

describe('PrometheusChatappController', () => {
  let controller: PrometheusChatappController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrometheusChatappController],
    }).compile();

    controller = module.get<PrometheusChatappController>(PrometheusChatappController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
