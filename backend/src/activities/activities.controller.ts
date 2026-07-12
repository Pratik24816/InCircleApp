import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../auth/guards/public.decorator';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { JoinActivityDto } from './dto/join-activity.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Public()
  @Get()
  list(
    @Query('city') city?: string,
    @Query('categoryId') categoryId?: string,
    @Query('q') q?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('excludeFeatured') excludeFeatured?: string,
  ) {
    return this.activitiesService.findAll({
      city,
      categoryId,
      q,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      excludeFeatured: excludeFeatured === 'true',
    });
  }

  @Public()
  @Get('tonight')
  tonight(@Query('city') city?: string, @Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.activitiesService.findTonight(
      city,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }

  @Public()
  @Get('featured')
  featured(@Query('city') city?: string, @Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.activitiesService.findFeatured(
      city,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }

  @Public()
  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string, @Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.activitiesService.findById(
      id,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateActivityDto) {
    return this.activitiesService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  join(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body() dto: JoinActivityDto,
  ) {
    return this.activitiesService.join(id, userId, dto.status ?? 'joined');
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/maybe')
  maybe(@Param('id', ParseUUIDPipe) id: string, @GetUser('id') userId: string) {
    return this.activitiesService.join(id, userId, 'maybe');
  }
}

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UserActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('activities')
  myActivities(@GetUser('id') userId: string, @Query('role') role: 'joined' | 'created' | 'completed' = 'joined') {
    return this.activitiesService.findForUser(userId, role);
  }
}
