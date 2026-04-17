import { Test, TestingModule } from '@nestjs/testing';
import { EmiterSubscribersService } from './emiter-subscribers.service';

describe('EmiterSubscribersService', () => {
  let service: EmiterSubscribersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmiterSubscribersService],
    }).compile();

    service = module.get<EmiterSubscribersService>(EmiterSubscribersService);
  });

});
