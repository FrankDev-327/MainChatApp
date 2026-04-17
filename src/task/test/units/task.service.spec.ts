import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../../task.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatTaskEntity } from '../../../entities/chat.task.entity';
import { LoggerPrint } from '../../../logger/logger.print';

describe('TaskService', () => {
  let taskService: TaskService;
  let chatTaksRepository: Repository<ChatTaskEntity>;
  let CHAT_TASK_TOKEN = getRepositoryToken(ChatTaskEntity);
  const mockTaskService = {
    createTask: jest.fn(),
    getTaskDetails: jest.fn(),
    listingTaskByDriverId: jest.fn(),
  }

  const mockLoggerPrint = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskService,
          useValue: mockTaskService
        },
        {
          provide: CHAT_TASK_TOKEN,
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          }
        },
        {
          provide: LoggerPrint,
          useValue: mockLoggerPrint
        }
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    chatTaksRepository = module.get<Repository<ChatTaskEntity>>(ChatTaskEntity); 
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      jest.spyOn(chatTaksRepository, 'save').mockResolvedValueOnce(new ChatTaskEntity());
      const payload = {
      
      }

    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
