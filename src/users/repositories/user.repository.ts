import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

/**
 * Repository para operações de dados de usuários
 * Abstrai acesso ao banco de dados seguindo Repository Pattern
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Cria novo usuário
   * @param createUserDto Dados do usuário
   * @returns Promise<User> Usuário criado
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Busca usuário por email
   * @param email Email do usuário
   * @returns Promise<User | null> Usuário ou null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'firstName', 'lastName', 'password', 'isActive', 'lastLoginAt'],
    });
  }

  /**
   * Busca usuário por ID
   * @param id ID do usuário
   * @returns Promise<User | null> Usuário ou null
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'lastLoginAt'],
    });
  }

  /**
   * Atualiza último login do usuário
   * @param id ID do usuário
   * @returns Promise<void>
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Atualiza usuário
   * @param id ID do usuário
   * @param updateData Dados para atualizar
   * @returns Promise<User> Usuário atualizado
   */
  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);

    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    return updatedUser;
  }
}
