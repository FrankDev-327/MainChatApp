import { Test, TestingModule } from '@nestjs/testing';
import { ChatCarsService } from './chat.cars.service';

describe('ChatCarsService', () => {
  let service: ChatCarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatCarsService],
    }).compile();

    service = module.get<ChatCarsService>(ChatCarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
