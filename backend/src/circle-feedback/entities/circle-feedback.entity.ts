import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('circle_feedback')
export class CircleFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32 })
  avatarId: string;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 32 })
  category: string;

  @Column({ type: 'int', default: 0 })
  fireCount: number;

  @Column({ type: 'int' })
  memberNumber: number;

  @CreateDateColumn()
  createdAt: Date;
}
