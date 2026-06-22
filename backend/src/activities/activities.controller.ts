import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../auth/guards/public.decorator';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { JoinActivityDto } from './dto/join-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List approved activities for the home feed' })
  @ApiQuery({ name: 'city', required: false, example: 'Ahmedabad' })
  @ApiQuery({ name: 'categoryId', required: false, format: 'uuid' })
  @ApiQuery({ name: 'q', required: false, description: 'Search title or location' })
  @ApiQuery({ name: 'lat', required: false, type: Number, description: 'Reference latitude for distanceKm' })
  @ApiQuery({ name: 'lng', required: false, type: Number, description: 'Reference longitude for distanceKm' })
  @ApiQuery({ name: 'excludeFeatured', required: false, type: Boolean })
  @ApiOkResponse({ type: ActivityResponseDto, isArray: true })
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
  @ApiOperation({ summary: 'List activities happening tonight' })
  @ApiQuery({ name: 'city', required: false, example: 'Ahmedabad' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiOkResponse({ type: ActivityResponseDto, isArray: true })
  tonight(@Query('city') city?: string, @Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.activitiesService.findTonight(
      city,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get the featured activity for the home feed hero card' })
  @ApiQuery({ name: 'city', required: false, example: 'Ahmedabad' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiOkResponse({ type: ActivityResponseDto })
  featured(@Query('city') city?: string, @Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.activitiesService.findFeatured(
      city,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single activity by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiOkResponse({ type: ActivityResponseDto })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  getOne(@Param('id', ParseUUIDPipe) id: string, @Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.activitiesService.findById(
      id,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new activity (mobile create event flow)' })
  @ApiBody({
    type: CreateActivityDto,
    examples: {
      openJoin: {
        summary: 'Open join event',
        value: {
          title: 'Morning Riverfront Walk',
          description: 'Easy 5 km walk along Sabarmati. All paces welcome.',
          categoryId: 'f193696a-9ed4-4930-bec5-faa284b18aef',
          startDatetime: '2026-06-22T18:00:00.000Z',
          locationName: 'Sabarmati Riverfront Gate 3',
          city: 'Ahmedabad',
          latitude: 23.0395,
          longitude: 72.5853,
          groupType: 'open_join',
          groupSize: 12,
          tags: ['walk', 'morning'],
          vibeTags: ['chill', 'new_friends'],
        },
      },
    },
  })
  @ApiCreatedResponse({ type: ActivityResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid category' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  create(@GetUser('id') userId: string, @Body() dto: CreateActivityDto) {
    return this.activitiesService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an activity (host only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({
    type: UpdateActivityDto,
    examples: {
      updateTitle: {
        summary: 'Update title and description',
        value: {
          title: 'Evening Riverfront Walk',
          description: 'Updated route and pace.',
        },
      },
    },
  })
  @ApiOkResponse({ type: ActivityResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed, past start time, or activity is closed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Only the host can modify this activity' })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel an activity (host only, soft delete)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ActivityResponseDto, description: 'Activity with status set to cancelled' })
  @ApiBadRequestResponse({ description: 'Activity is already done, cancelled, or closed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Only the host can cancel this activity' })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser('id') userId: string) {
    return this.activitiesService.cancel(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Join an activity (RSVP as joined)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({
    type: JoinActivityDto,
    required: false,
    examples: {
      joined: {
        summary: 'RSVP as joined (default)',
        value: { status: 'joined' },
      },
      maybe: {
        summary: 'RSVP as maybe',
        value: { status: 'maybe' },
      },
    },
  })
  @ApiOkResponse({ type: ActivityResponseDto })
  @ApiBadRequestResponse({ description: 'Activity is full' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  join(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body() dto: JoinActivityDto,
  ) {
    return this.activitiesService.join(id, userId, dto.status ?? 'joined');
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/maybe')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'RSVP as maybe for an activity' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ActivityResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  maybe(@Param('id', ParseUUIDPipe) id: string, @GetUser('id') userId: string) {
    return this.activitiesService.join(id, userId, 'maybe');
  }
}

@ApiTags('activities')
@ApiBearerAuth('JWT-auth')
@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UserActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('activities')
  @ApiOperation({ summary: 'List activities for the current user (My Events tabs)' })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['joined', 'created', 'completed'],
    description: 'Tab filter for My Events screen',
  })
  @ApiOkResponse({ type: ActivityResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  myActivities(@GetUser('id') userId: string, @Query('role') role: 'joined' | 'created' | 'completed' = 'joined') {
    return this.activitiesService.findForUser(userId, role);
  }
}
