import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

interface CreateRefreshTokenData {
  token: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Repository para operações de refresh tokens
 * Responsável exclusivamente pela comunicação com a tabela 'refresh_tokens'.
 */
@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Cria novo refresh token
   * @param data Dados do token
   * @returns Promise<RefreshToken> Token criado
   */
  async createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create(data);
    return this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Busca token válido
   * @param token Token string
   * @returns Promise<RefreshToken | null> Token ou null
   */
  async findValidToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: {
        token,
        isRevoked: false,
      },
      relations: ['user'],
    });
  }

  /**
   * Revoga um token específico
   * @param tokenId ID do token
   * @returns Promise<void>
   */
  async revokeToken(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.update(tokenId, {
      isRevoked: true,
    });
  }

  /**
   * Revoga todos os tokens do usuário
   * @param userId ID do usuário
   * @returns Promise<void>
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId },
      { isRevoked: true },
    );
  }
}
