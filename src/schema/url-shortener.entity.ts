import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UrlShortener {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    url: string;

    @Column({ nullable: true })
    urlShortener?: string;

    @Column({ nullable: true })
    user?: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ nullable: true })
    updated_at?: Date;

    @Column({ default: 1 })
    version: number;

    @Column({ default: true })
    active: boolean;

    @Column({ default: 0 })
    clicks: number;
}
