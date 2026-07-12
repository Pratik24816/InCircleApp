import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

const IMAGE_MIME = /\/(jpg|jpeg|png|webp)$/;

function imageUploadOptions(destination: string) {
  return {
    storage: diskStorage({
      destination,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const userId = req.user ? req.user['id'] : 'anonymous';
        callback(null, `${userId}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (_req, file, callback) => {
      if (!file.mimetype.match(IMAGE_MIME)) {
        return callback(
          new BadRequestException('Only images (jpg, jpeg, png, webp) are allowed!'),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: 8 * 1024 * 1024,
    },
  };
}

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post('activity-cover')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions('./uploads/activity-covers')))
  uploadActivityCover(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded or file format is invalid');
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const url = `${backendUrl}/uploads/activity-covers/${file.filename}`;
    return { url, userId };
  }
}
