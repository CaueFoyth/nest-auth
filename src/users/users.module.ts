import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

/**
 * Módulo de Usuários
 * Gerencia entidades e operações relacionadas a usuários
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  providers: [UserService, UserRepository, RefreshTokenRepository],
  exports: [UserService, UserRepository, RefreshTokenRepository],
})
export class UsersModule {}