import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Interest } from './interest.entity';

@Entity('user_interests')
@Unique(['userId', 'interestId'])
export class UserInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  interestId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Interest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interestId' })
  interest: Interest;
}
