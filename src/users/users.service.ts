import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async validateForGithubLogin(profile: {
    platformId: number;
    name: string;
    email: string;
    image?: string;
  }): Promise<User> {
    const { platformId, name, email, image } = profile;

    let user = await this.usersRepository.findOne({
      where: { platformId },
      select: ["id", "platformId", "name", "email", "image", "role"],
    });

    if (!user) {
      user = this.usersRepository.create({
        platformId,
        name,
        email,
        image,
        role: (await this.count()) === 0 ? UserRole.ADMIN : UserRole.USER,
      });
    } else {
      if (user.name !== name || user.email !== email || user.image !== image) {
        user.name = name;
        user.email = email;
        user.image = image;
      }
    }

    await this.usersRepository.save(user);
    return user;
  }
  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, userData);
    return this.usersRepository.save(user);
  }
}
