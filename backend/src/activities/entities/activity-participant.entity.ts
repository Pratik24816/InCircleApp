import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from './activity.entity';

export type ParticipantStatus = 'joined' | 'maybe' | 'left' | 'removed';

@Entity('activity_participants')
@Unique(['activityId', 'userId'])
export class ActivityParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  activityId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', default: 'joined' })
  status: ParticipantStatus;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => Activity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
