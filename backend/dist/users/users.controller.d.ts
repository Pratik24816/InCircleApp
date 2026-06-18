import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: User): User;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User>;
    updateProfilePhoto(userId: string, file: Express.Multer.File): Promise<User>;
    getUserById(id: string): Promise<User>;
}
