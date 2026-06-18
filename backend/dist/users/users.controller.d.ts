import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CatalogService } from '../catalog/catalog.service';
export declare class UsersController {
    private readonly usersService;
    private readonly catalogService;
    constructor(usersService: UsersService, catalogService: CatalogService);
    getMe(user: User): Promise<{
        interestIds: string[];
        id: string;
        email: string;
        username: string | null;
        fullName: string;
        bio: string | null;
        city: string;
        googleId: string;
        googlePhotoUrl: string | null;
        customPhotoUrl: string | null;
        hashedRefreshToken: string | null;
        isProfileCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User>;
    updateProfilePhoto(userId: string, file: Express.Multer.File): Promise<User>;
    getUserById(id: string): Promise<User>;
}
