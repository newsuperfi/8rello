import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

// 회원가입, 사용자 정보 수정
@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async signup(user: CreateUserDto): Promise<{ message: string }> {
    const existingUser = await this.userRepository.findOne({ where: { email: user.email } });
    if (existingUser) {
      throw new HttpException('이미 존재하는 사용자입니다.', HttpStatus.CONFLICT);
    }
    const encryptedPassword = await bcrypt.hash(user.password, 10);

    try {
      await this.userRepository.save({ ...user, password: encryptedPassword });
      return { message: '회원가입이 성공적으로 완료되었습니다.' };
    } catch (error) {
      throw new HttpException('서버 에러', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(id: number, user: UpdateUserDto): Promise<{ message: string }> {
    const existingUser: User = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) throw new NotFoundException('id와 일치하는 유저가 없습니다.');
    existingUser.username = user.username;

    try {
      await this.userRepository.save(existingUser);
      return { message: '닉네임이 수정되었습니다.' };
    } catch (error) {
      throw new HttpException('서버 에러', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
}
