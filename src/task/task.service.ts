import { BadRequestException, Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { CreateTaskDto } from '../dto/task/create.task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { ChatTaskEntity } from '../entities/chatt.tasks.entity';
import {
  totalRequestConter,
  databaseResponseTimeHistogram,
} from '../prometheus-chatapp/prometheus-chatapp.exporters';
import { ChatTaskListingByDriverDto } from '../dto/chat.tasks/chat.task.listing.driver.dto';
import { FilterByDate } from '../entities/chat.task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(ChatTaskEntity)
    private readonly taskRepository: Repository<ChatTaskEntity>,
    private readonly loggerPrint: LoggerPrint,
  ) {}

  async createTask(dto: CreateTaskDto): Promise<ChatTaskEntity> {
    const timer = databaseResponseTimeHistogram.startTimer();
    try {
      const taskData: DeepPartial<ChatTaskEntity> = {
        title: dto.taskTitle,
        isRoot: dto?.isRoot,
        parentTaskId: dto.isRoot ? dto.parentTaskId : 0,
        creatorId: dto.sender_id,
        receiverId: dto.receiver_id,
        vehicleId: dto.vehicleId ?? 0,
        shipmentId: dto.shipmentId ?? '',
        description: dto.description,
        taskType: dto.taskType,
        requireBarcode: dto?.requireBarcode,
        requireLocation: dto?.requireLocation,
        requireSignature: dto?.requireSignature,
        status: dto.status ?? 'assigned',
        deadlineStart: dto.deadlineStart ?? null,
        deadlineEnd: dto.deadlineEnd ?? null,
        deadlineType: dto.deadlineType ?? 'ASAP',
        location: dto.location ?? '',
        createdAt: new Date(),
      };

      const newTask = this.taskRepository.create(taskData);
      const taskCreated = await this.taskRepository.save(newTask);
      timer({ method: 'POST', route: 'task/create', status: '200' });
      return taskCreated;
    } catch (error) {
      this.loggerPrint.error(error.message);
      totalRequestConter.inc({
        method: ' POST',
        route: 'task/create',
        status: 500,
      });
      throw new BadRequestException(error.message);
    }
  }

  async getTaskDetails(taskId: number): Promise<any> {
    const timer = databaseResponseTimeHistogram.startTimer();
    try {
      const parentTask = await this.taskRepository
        .createQueryBuilder('chatTasks')
        .select('*')
        .where('chatTasks.taskId = :taskId', { taskId: taskId })
        .getRawOne();

      const subtasks = await this.taskRepository
        .createQueryBuilder('chatTasks')
        .select('*')
        .where('chatTasks.parentTaskId = :taskId', { taskId: taskId })
        .andWhere('chatTasks.is_root = 0')
        .getRawMany();

      timer({
        method: ' GET',
        route: 'task/:taskId',
        status: 200,
      });
      return {
        ...parentTask,
        subtasks,
      };
    } catch (error) {
      totalRequestConter.inc({
        method: ' GET',
        route: 'task/:taskId',
        status: 500,
      });
      this.loggerPrint.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async listingTaskByDriverId(
    driverId: number,
    dto: ChatTaskListingByDriverDto,
  ): Promise<ChatTaskEntity[]> {
    const timer = databaseResponseTimeHistogram.startTimer();
    try {
      const taskQuery = this.taskRepository.createQueryBuilder('chatTasks');
      taskQuery
        .addSelect((qb) => {
          return qb
            .subQuery()
            .select('COUNT(st.parentTaskId)')
            .from(ChatTaskEntity, 'st')
            .where('st.parentTaskId = chatTasks.taskId')
            .andWhere('st.is_root = 0');
        }, 'subtaskCount')
        .where('chatTasks.receiverId = :driverId', { driverId: driverId })
        .andWhere('chatTasks.status = :typeStatus', {
          typeStatus: dto.typeStatus,
        });

      if (dto.filterByDate === FilterByDate.TODAY) {
        taskQuery.andWhere(
          `chatTasks.deadlineStart >= CURDATE() AND chatTasks.deadlineStart < CURDATE() + INTERVAL 1 DAY`,
        );
      }

      if (dto.filterByDate === FilterByDate.THIS_WEEK) {
        taskQuery.andWhere(
          `chatTasks.deadlineStart >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
           AND chatTasks.deadlineStart < DATE_ADD(
           DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY),
           INTERVAL 7 DAY
          )`,
        );
      }

      if (dto.filterByDate === FilterByDate.THIS_MONTH) {
        taskQuery.andWhere(`
            chatTasks.deadlineStart >= DATE_FORMAT(CURDATE(), "%Y-%m-01")
            AND chatTasks.deadlineStart < DATE_ADD(
            DATE_FORMAT(CURDATE(), "%Y-%m-01"),
            INTERVAL 1 MONTH
          )`);
      }

      taskQuery.groupBy('chatTasks.taskId');
      const taskLists = await taskQuery.getRawMany();
      timer({
        method: ' GET',
        route: 'task/drivers/:driverId',
        status: 200,
      });
      return taskLists;
    } catch (error) {
      totalRequestConter.inc({
        method: ' GET',
        route: 'task/drivers/:driverId',
        status: 500,
      });
      this.loggerPrint.error(error.message);
      throw new BadRequestException(error.message);
    }
  }
}
