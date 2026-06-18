import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updateData: Partial<User> = {};

    if (updateProfileDto.fullName !== undefined) {
      updateData.fullName = updateProfileDto.fullName;
    }

    if (updateProfileDto.bio !== undefined) {
      updateData.bio = updateProfileDto.bio;
    }

    if (updateProfileDto.username !== undefined) {
      // If updating username, check for uniqueness
      const existingUser = await this.userRepository.findOne({
        where: { username: updateProfileDto.username },
      });
      
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Username is already taken');
      }

      updateData.username = updateProfileDto.username;
      
      // If the user sets a username for the first time, complete their profile onboarding
      if (!user.isProfileCompleted) {
        updateData.isProfileCompleted = true;
      }
    }

    return this.update(userId, updateData);
  }

  async updateProfilePhoto(userId: string, customPhotoUrl: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return this.update(userId, { customPhotoUrl });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    let hashedRefreshToken: string | null = null;
    if (refreshToken) {
      hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    }
    await this.userRepository.update(userId, { hashedRefreshToken });
  }

  async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      return false;
    }
    return bcrypt.compare(refreshToken, user.hashedRefreshToken);
  }
}
