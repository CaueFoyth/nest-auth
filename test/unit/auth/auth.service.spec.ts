import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../src/auth/services/auth.service';
import { UserService } from '../../../src/users/services/user.service';
import { PasswordService } from '../../../src/auth/services/password.service';
import { TokenService } from '../../../src/auth/services/token.service';
import { User } from '../../../src/users/entities/user.entity';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { LoginDto } from 'src/auth/dto/login.dto';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
  };

  const mockTokenService = {
    generateTokenPair: jest.fn(),
    refreshTokens: jest.fn(),
    revokeAllTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'StrongPass123!',
    };

    it('deve orquestrar a criação, hash de senha para um novo usuário', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: '1',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: hashedPassword,
      };
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockUserService.findByEmail.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserService.create.mockResolvedValue(createdUser);
      mockTokenService.generateTokenPair.mockResolvedValue(tokens);

      const result = await authService.register(registerDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(mockUserService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve lançar ConflictException ao tentar registrar um e-mail que já existe', async () => {
      const existingUser = { id: '1', email: registerDto.email };
      mockUserService.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);

      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
    };

    it('deve autenticar com sucesso um usuário ativo com credenciais válidas', async () => {
      const userFromDb = {
        id: '1',
        email: loginDto.email,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        isActive: true,
      };
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockUserService.findByEmail.mockResolvedValue(userFromDb);
      mockPasswordService.verifyPassword.mockResolvedValue(true);
      mockUserService.updateLastLogin.mockResolvedValue(undefined);
      mockTokenService.generateTokenPair.mockResolvedValue(tokens);

      const result = await authService.login(loginDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith(
        'hashedPassword',
        loginDto.password,
      );
      expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(userFromDb.id);
      expect(result.user).not.toHaveProperty('password');
      expect(result.accessToken).toBe(tokens.accessToken);
    });

    it('deve lançar UnauthorizedException se o e-mail não for encontrado no banco de dados', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha fornecida estiver incorreta', async () => {
      const userFromDb = {
        id: '1',
        email: loginDto.email,
        password: 'hashedPassword',
        isActive: true,
      };

      mockUserService.findByEmail.mockResolvedValue(userFromDb);
      mockPasswordService.verifyPassword.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException ao tentar logar com um usuário inativo', async () => {
      const inactiveUser = {
        id: '1',
        email: loginDto.email,
        password: 'hashedPassword',
        isActive: false,
      };

      mockUserService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
