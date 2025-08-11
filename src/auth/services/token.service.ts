import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { TokenPair } from '../interfaces/token-pair.interface';
import { RefreshTokenRepository } from '../../users/repositories/refresh-token.repository';
import { BlockedJwtRepository } from '../repositories/blocked-jwt.repository';

/**
 * Serviço responsável pela gestão de tokens JWT
 * Implementa padrão de Access Token + Refresh Token para máxima segurança
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly blockedJwtRepository: BlockedJwtRepository,
  ) { }

  /**
   * Gera par de tokens (access + refresh)
   * @param payload Dados do usuário para o JWT
   * @returns Promise<TokenPair> Par de tokens
   */
  async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload.sub),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Valida um refresh token e gera um novo par de tokens (rotação de token).
   * @param token O refresh token enviado pelo cliente.
   * @returns Promise<TokenPair> Um novo par de tokens.
   */
  async refreshTokens(token: string): Promise<TokenPair> {
    const storedToken = await this.refreshTokenRepository.findValidToken(token);

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    await this.refreshTokenRepository.revokeToken(storedToken.id);

    const payload: JwtPayload = {
      sub: storedToken.userId,
      email: storedToken.user.email,
    };

    return this.generateTokenPair(payload);
  }

  /**
   * Revoga todos os refresh tokens ativos de um usuário.
   * Usado para a funcionalidade de "logout em todos os dispositivos".
   * @param userId O ID do usuário.
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }

  /**
   * Verifica se um token está na blocklist do BD.
   * @param jti JWT ID do token
   * @returns Promise<boolean> True se o token estiver bloqueado
   */
  async isTokenBlocklisted(jti: string): Promise<boolean> {
    const count = await this.blockedJwtRepository.count({ where: { jti } });
    return count > 0;
  }

  /**
   * Gera Access Token (curta duração)
   * @param payload Dados do JWT
   * @returns Promise<string> Access token
   */
  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    const jwtPayload = {
      ...payload,
      jti: uuidv4(),
    };

    return this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRE_TIME') || '15m',
    });
  }

  /**
   * Gera Refresh Token (longa duração) e armazena no banco
   * @param userId ID do usuário
   * @returns Promise<string> Refresh token
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
      Number(this.configService.get<number>('JWT_REFRESH_EXPIRE_DAYS') || 7),
    );

    await this.refreshTokenRepository.createRefreshToken({
      token,
      userId,
      expiresAt,
    });

    return token;
  }

  /**
   * Invalida o Refresh Token e adiciona o Access Token na blocklist do banco de dados.
   * @param userId O ID do usuário.
   * @param accessToken O JWT de acesso a ser invalidado.
   */
  async logout(userId: string, accessToken: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId);

    try {
      const decoded = this.jwtService.decode(accessToken) as { exp: number; jti: string };
      if (decoded && decoded.jti && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        await this.blockedJwtRepository.create({ jti: decoded.jti, expiresAt });
      }
    } catch (error) {
      console.error('Falha ao adicionar token à blocklist do BD:', error);
    }
  }
}