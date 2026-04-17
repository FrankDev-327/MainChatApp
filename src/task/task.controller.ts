import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import {
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CheckTokenGuard } from '../check.token/check.token.guard';
import { CreateTaskDto } from '../dto/task/create.task.dto';
import { TaskResponseDto } from '../dto/task/response.task.created.dto';
import { ChatTaskListingByDriverDto } from '../dto/chat.tasks/chat.task.listing.driver.dto';
import { ChatTaskListResponseDto } from '../dto/task/response.task.drivers.list.dto';
import { TaskDetailsResponseDto } from '../dto/task/response.task.details.dto';

@ApiTags('Task')
@Controller('task')
export class TaskController {
    constructor(private taskService: TaskService) { }

    @UseGuards(CheckTokenGuard)
    @Post('create')
    @ApiOperation({ summary: 'Create a new task' })
    @ApiOkResponse({ type: TaskResponseDto })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async createTask(@Body() body: CreateTaskDto) {
        return this.taskService.createTask(body);
    }

    @UseGuards(CheckTokenGuard)
    @Get('drivers/:driverId')
    @ApiOperation({ summary: 'List tasks by driver Id' })
    @ApiOkResponse({ type: [ChatTaskListResponseDto] })
    async listingTaskByDriverId(@Param('driverId') driver: number,
        @Query() dto: ChatTaskListingByDriverDto
    ) {
        return this.taskService.listingTaskByDriverId(driver, dto);
    }

    @UseGuards(CheckTokenGuard)
    @Get('/:taskId')
    @ApiOperation({ summary: 'Get tasks details by task Id' })
    @ApiOkResponse({ type: TaskDetailsResponseDto })
    async getTaskDetails(@Param('taskId') taskId: number) {
        return this.taskService.getTaskDetails(taskId);
    }
}
