import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../auth/guards/public.decorator';
import { CatalogService } from './catalog.service';
import { UpdateUserInterestsDto } from './dto/update-user-interests.dto';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get('interests')
  getInterests() {
    return this.catalogService.findAllInterests();
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.catalogService.findAllCategories();
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/me/interests')
  setInterests(@GetUser('id') userId: string, @Body() dto: UpdateUserInterestsDto) {
    return this.catalogService.setUserInterests(userId, dto.interestIds);
  }
}
