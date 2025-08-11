import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

/**
 * Serviço de usuários
 * Lógica de negócio relacionada a usuários
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Cria novo usuário
   * @param createUserDto Dados do usuário
   * @returns Promise<User> Usuário criado
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.create(createUserDto);
  }

  /**
   * Busca usuário por email
   * @param email Email do usuário
   * @returns Promise<User | null> Usuário ou null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Busca usuário por ID
   * @param id ID do usuário
   * @returns Promise<User> Usuário
   * @throws NotFoundException se usuário não existe
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  /**
   * Atualiza último login
   * @param id ID do usuário
   * @returns Promise<void>
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }
}