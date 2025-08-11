import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/auth/controllers/auth.controller';
import { AuthService } from '../../../src/auth/services/auth.service';
import { RegisterDto } from '../../../src/auth/dto/register.dto';
import { LoginDto } from '../../../src/auth/dto/login.dto';
import { User } from '../../../src/users/entities/user.entity';
import { AuthResponse } from 'src/auth/types/auth-response.type';

const mockAuthService: jest.Mocked<AuthService> = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
};

const mockRegisterDto: RegisterDto = {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'StrongPass123!',
};

const mockLoginDto: LoginDto = {
  email: 'test@example.com',
  password: 'StrongPass123!',
};

const mockUser = new User({
  id: 'user-id-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
});

const mockAuthResponse: AuthResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: { id: mockUser.id, email: mockUser.email },
  expiresIn: 900,
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve garantir que o controller foi instanciado corretamente', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('ao registrar, deve invocar o serviço de autenticação com os dados corretos e retornar a resposta do serviço', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(mockRegisterDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('ao logar, deve invocar o serviço de autenticação com as credenciais corretas e retornar a resposta do serviço', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('getProfile', () => {
    it('ao buscar o perfil, deve retornar o objeto de usuário completo que foi injetado pelo decorator de autenticação', async () => {
      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('ao deslogar, deve invocar o serviço de logout com o ID do usuário e o token, e retornar uma mensagem de sucesso', async () => {
      const mockHeaders = { authorization: 'Bearer fake-access-token' };
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockUser, mockHeaders);

      expect(mockAuthService.logout).toHaveBeenCalledWith(
        mockUser.id,
        'fake-access-token',
      );
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Logout realizado com sucesso' });
    });
  });
});
