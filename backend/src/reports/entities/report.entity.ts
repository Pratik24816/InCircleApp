import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  reporterId: string;

  @Column()
  reportType: string;

  @Column()
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';

  @Column({ type: 'uuid', nullable: true })
  activityId: string | null;

  @Column({ type: 'uuid', nullable: true })
  reportedUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @ManyToOne(() => Activity, { nullable: true })
  @JoinColumn({ name: 'activityId' })
  activity: Activity | null;
}
