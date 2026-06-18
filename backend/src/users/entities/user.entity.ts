import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Expose, Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Index({ unique: true })
  @Column({ unique: true, nullable: true })
  username: string | null;

  @Column()
  fullName: string;

  @Column({ nullable: true, type: 'text' })
  bio: string | null;

  @Index({ unique: true })
  @Column()
  googleId: string;

  @Column({ nullable: true, type: 'text' })
  googlePhotoUrl: string | null;

  @Column({ nullable: true, type: 'text' })
  customPhotoUrl: string | null;

  @Exclude()
  @Column({ nullable: true, type: 'text' })
  hashedRefreshToken: string | null;

  @Column({ default: false })
  isProfileCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  get profilePhoto(): string {
    return this.customPhotoUrl || this.googlePhotoUrl || '';
  }
}
