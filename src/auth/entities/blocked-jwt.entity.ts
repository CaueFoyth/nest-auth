import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('blocked_jwts')
export class BlockedJwt {
  @PrimaryColumn()
  jti: string;

  @Column()
  expiresAt: Date;
}
