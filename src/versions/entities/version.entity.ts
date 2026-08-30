import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';

@Entity('versions')
@Index(['service', 'version'], { unique: true })
export class Version {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Service, (service) => service.versions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ type: 'text' })
  version: string;

  @Column({ type: 'text' })
  changelog: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
