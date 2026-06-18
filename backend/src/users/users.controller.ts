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
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Patch('profile-photo')
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
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }
    return user;
  }
}
