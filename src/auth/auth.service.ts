import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User, UserRole } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async validateGithubUser(githubUser: any) {
    const { githubId } = githubUser;
    let user = await this.usersService.findByGithubId(githubId);

    if (!user) {
      user = await this.usersService.create({
        ...githubUser,
        role: (await this.usersService.count()) === 0 ? UserRole.ADMIN : UserRole.USER,
      });
    } else {
      user = await this.usersService.update(user.id, {
        username: githubUser.username,
        email: githubUser.email,
        avatarUrl: githubUser.avatarUrl,
      });
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
}
