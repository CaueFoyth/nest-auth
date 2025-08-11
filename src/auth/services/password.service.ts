import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Serviço responsável EXCLUSIVAMENTE por operações criptográficas de senhas.
 */
@Injectable()
export class PasswordService {
  /**
   * Gera o hash de uma senha em texto plano.
   * @param password A senha a ser hasheada.
   * @returns O hash da senha gerado pelo Argon2.
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });
    } catch (err) {
      console.error('Erro ao gerar hash com Argon2:', err);
      throw new Error('Erro interno ao processar a senha.');
    }
  }

  /**
   * Compara uma senha em texto plano com um hash existente.
   * @param hashedPassword O hash que está salvo no banco de dados.
   * @param plainPassword A senha que o usuário enviou.
   * @returns `true` se a senha corresponder ao hash, `false` caso contrário.
   */
  async verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (err) {
      console.error('Erro ao verificar hash com Argon2:', err);
      return false;
    }
  }
}
