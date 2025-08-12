import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../../users/services/user.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Serviço principal de autenticação
 * Coordena todas as operações de registro, login e gestão de tokens
 * Segue Single Responsibility Principle - apenas lógica de autenticação
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Registra novo usuário no sistema
   * @param registerDto Dados de registro
   * @returns Promise<AuthResponseDto> Dados do usuário
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Usuário já existe com este email');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      registerDto.password,
    );

    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });

    delete user.password;

    return {
      user,
      expiresIn: 900,
    };
  }

  /**
   * Autentica usuário no sistema
   * @param loginDto Credenciais de login
   * @returns Promise<AuthResponseDto> Tokens e dados do usuário
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.password) {
      throw new UnauthorizedException('Credenciais inválidas (usuário sem senha configurada).');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    await this.userService.updateLastLogin(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const tokens = await this.tokenService.generateTokenPair(payload);

    delete user.password;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      expiresIn: 900,
    };
  }

  /**
   * Refresh de tokens
   * @param refreshToken Token de refresh
   * @returns Promise<AuthResponseDto> Novos tokens
   */
  async refresh(refreshToken: string): Promise<Omit<AuthResponseDto, 'user'>> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token obrigatório');
    }

    const tokens = await this.tokenService.refreshTokens(refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 900,
    };
  }

  /**
   * Logout do usuário (revoga todos os tokens)
   * @param userId ID do usuário
   */
  async logout(userId: string, accessToken: string): Promise<void> {
    await this.tokenService.logout(userId, accessToken);
  }
}
