import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_notification_preferences')
export class UserNotificationPreference {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @Column({ default: true })
  pushActivity: boolean;

  @Column({ default: true })
  pushChat: boolean;

  @Column({ default: true })
  pushReminders: boolean;

  @Column({ default: true })
  pushDiscovery: boolean;

  @Column({ default: true })
  pushEnabled: boolean;

  @Column({ type: 'varchar', default: 'cheesy' })
  tone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
