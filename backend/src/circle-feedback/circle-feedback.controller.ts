import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { Public } from '../auth/guards/public.decorator';
import { CircleFeedbackService } from './circle-feedback.service';
import { CreateCircleFeedbackDto } from './dto/create-circle-feedback.dto';

@Controller('circle-feedback')
export class CircleFeedbackController {
  constructor(private readonly circleFeedbackService: CircleFeedbackService) {}

  @Public()
  @Get()
  findAll(@Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 100;
    return this.circleFeedbackService.findRecent(Number.isNaN(parsed) ? 100 : parsed);
  }

  @Public()
  @Post()
  create(@Body() dto: CreateCircleFeedbackDto) {
    return this.circleFeedbackService.create(dto);
  }

  @Public()
  @Post(':id/react')
  react(@Param('id', ParseUUIDPipe) id: string) {
    return this.circleFeedbackService.react(id);
  }
}
