import { Test, TestingModule } from '@nestjs/testing';
import { PrometheusChatappService } from '../../prometheus-chatapp.service';

describe('PrometheusChatappService', () => {
  let prometheusService: PrometheusChatappService;
  const mockPromService = {
    getMetrics: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrometheusChatappService,
        {
          provide: PrometheusChatappService,
          useValue: mockPromService,
        },
      ],
    }).compile();

    prometheusService = module.get<PrometheusChatappService>(
      PrometheusChatappService,
    );
  });

  describe('getMetrics', () => {
    it('should return at least process_cpu_user_seconds_total metric as string', async () => {
      const mockResult =
        'process_cpu_user_seconds_total{app="chat_sky_track_app"}';
      jest
        .spyOn(mockPromService, 'getMetrics')
        .mockResolvedValueOnce(mockResult);

      expect(await prometheusService.getMetrics()).toContain(
        'process_cpu_user_seconds_total',
      );
      expect(mockPromService.getMetrics).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
