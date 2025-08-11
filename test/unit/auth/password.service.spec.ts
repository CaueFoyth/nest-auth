import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../../../src/auth/services/password.service';
import * as argon2 from 'argon2';

jest.mock('argon2');
const mockedArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe('PasswordService', () => {
  let service: PasswordService;

  const plainPassword = 'mySecretPassword123';
  const hashedPassword = '$argon2id$v=19$m=65536,t=3,p=1$mockHash';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('deve invocar argon2.hash com a senha e as opções corretas, retornando o hash gerado', async () => {
      mockedArgon2.hash.mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(plainPassword);

      expect(mockedArgon2.hash).toHaveBeenCalledWith(plainPassword, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });
      expect(mockedArgon2.hash).toHaveBeenCalledTimes(1);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('verifyPassword', () => {
    it('deve invocar argon2.verify e retornar true quando a senha e o hash correspondem', async () => {
      mockedArgon2.verify.mockResolvedValue(true);

      const result = await service.verifyPassword(hashedPassword, plainPassword);

      expect(mockedArgon2.verify).toHaveBeenCalledWith(hashedPassword, plainPassword);
      expect(mockedArgon2.verify).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('deve invocar argon2.verify e retornar false quando a senha e o hash não correspondem', async () => {
      const wrongPassword = 'wrongPassword';
      mockedArgon2.verify.mockResolvedValue(false);

      const result = await service.verifyPassword(hashedPassword, wrongPassword);

      expect(mockedArgon2.verify).toHaveBeenCalledWith(hashedPassword, wrongPassword);
      expect(result).toBe(false);
    });

    it('deve capturar uma exceção do argon2.verify, logar o erro e retornar false', async () => {
      const error = new Error('Invalid hash format');
      mockedArgon2.verify.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.verifyPassword('invalid-hash', plainPassword);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro ao verificar hash com Argon2:',
        error,
      );

      consoleSpy.mockRestore();
    });
  });
});
