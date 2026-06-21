import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MeResponseDto, UserResponseDto } from './dto/user-response.dto';
import { UPDATE_PROFILE_BODY_EXAMPLES } from './dto/swagger-examples';
import { CatalogService } from '../catalog/catalog.service';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly catalogService: CatalogService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile with linked interests' })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async getMe(@GetUser() user: User) {
    const interestIds = await this.catalogService.getUserInterestIds(user.id);
    return { ...user, interestIds };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile fields' })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Send one or more profile fields to update. All fields are optional.',
    examples: UPDATE_PROFILE_BODY_EXAMPLES,
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Username already taken' })
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Patch('profile-photo')
  @ApiOperation({ summary: 'Upload a custom profile photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, png, webp). Max 5MB.',
        },
      },
    },
    examples: {
      profilePhoto: {
        summary: 'Upload a profile image',
        description: 'Use multipart/form-data with field name `file`',
        value: {
          file: '(binary image file)',
        },
      },
    },
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'No file uploaded or invalid image type' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-photos',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          // Safe file name based on user id and timestamp
          const userId = req.user ? req.user['id'] : 'anonymous';
          callback(null, `${userId}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new BadRequestException('Only images (jpg, jpeg, png, webp) are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async updateProfilePhoto(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded or file format is invalid');
    }
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const fileUrl = `${backendUrl}/uploads/profile-photos/${file.filename}`;
    return this.usersService.updateProfilePhoto(userId, fileUrl);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user public profile by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'User ID' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID or user not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }
    return user;
  }
}
