import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockedJwt } from '../entities/blocked-jwt.entity';

@Injectable()
export class BlockedJwtRepository {
  constructor(
    @InjectRepository(BlockedJwt)
    private readonly repository: Repository<BlockedJwt>,
  ) {}

  async create(data: { jti: string; expiresAt: Date }): Promise<BlockedJwt> {
    const blockedToken = this.repository.create(data);
    return this.repository.save(blockedToken);
  }

  async save(blockedToken: BlockedJwt): Promise<BlockedJwt> {
    return this.repository.save(blockedToken);
  }

  async count(options: any): Promise<number> {
    return this.repository.count(options);
  }

  async findOne(options: any): Promise<BlockedJwt | null> {
    return this.repository.findOne(options);
  }

  async remove(blockedToken: BlockedJwt): Promise<void> {
    await this.repository.remove(blockedToken);
  }

  async removeExpiredTokens(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}