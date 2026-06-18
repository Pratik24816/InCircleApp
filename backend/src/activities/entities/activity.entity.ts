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
import { Category } from '../../catalog/entities/category.entity';

export type ActivityStatus =
  | 'open'
  | 'almost_full'
  | 'full'
  | 'done'
  | 'cancelled'
  | 'closed';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type GroupType = 'need_one_person' | 'fixed_group' | 'open_join';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  creatorId: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'text' })
  coverUrl: string | null;

  @Column({ type: 'timestamptz' })
  startDatetime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDatetime: Date | null;

  @Column()
  locationName: string;

  @Column({ default: 'Ahmedabad' })
  city: string;

  @Column({ type: 'double precision', default: 0 })
  latitude: number;

  @Column({ type: 'double precision', default: 0 })
  longitude: number;

  @Column({ type: 'varchar', default: 'open_join' })
  groupType: GroupType;

  @Column({ type: 'int', nullable: true })
  groupSize: number | null;

  @Column({ type: 'int', default: 0 })
  joinedCount: number;

  @Column({ type: 'varchar', default: 'open' })
  status: ActivityStatus;

  @Column({ type: 'varchar', default: 'approved' })
  approvalStatus: ApprovalStatus;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
