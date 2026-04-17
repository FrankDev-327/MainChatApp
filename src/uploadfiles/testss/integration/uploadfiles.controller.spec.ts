import { Test, TestingModule } from '@nestjs/testing';
import { UploadfilesController } from './uploadfiles.controller';

describe('UploadfilesController', () => {
  let controller: UploadfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadfilesController],
    }).compile();

    controller = module.get<UploadfilesController>(UploadfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
