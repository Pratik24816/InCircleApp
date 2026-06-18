export declare class User {
    id: string;
    email: string;
    username: string | null;
    fullName: string;
    bio: string | null;
    googleId: string;
    googlePhotoUrl: string | null;
    customPhotoUrl: string | null;
    hashedRefreshToken: string | null;
    isProfileCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    get profilePhoto(): string;
}
