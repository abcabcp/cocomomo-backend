import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthStrategy } from "./auth.strategy";
import { GithubStrategy } from "./github.strategy";

import { AuthResponseDto } from "./dto/auth-response.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private strategies: Record<string, AuthStrategy> = {};

  constructor(
    private jwtService: JwtService,
    private githubStrategy: GithubStrategy,
    private usersService: UsersService,
  ) {
    this.strategies.github = this.githubStrategy;
  }

  async handleLogin({ accessToken, platform }: { accessToken: string; platform: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> {
    const strategy = this.strategies[platform];
    if (!strategy) throw new Error("Unsupported platform");

    const profile = await strategy.getProfile(accessToken);
    const user = await this.usersService.validateForGithubLogin({
      platformId: profile.id,
      name: profile.name ?? "",
      email: profile.email ?? "",
      image: profile.image ?? "",
    });

    const payload = { userId: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: "7d" }),
      user,
    };
  }

  async refreshToken(
    refresh_token: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const payload = this.jwtService.decode(refresh_token);
    const user = await this.usersService.findById(payload.userId);
    const accessToken = this.jwtService.sign({ userId: user.id, role: user.role });
    const refreshToken = this.jwtService.sign(
      { userId: user.id, role: user.role },
      { expiresIn: "7d" },
    );
    return { accessToken, refreshToken, user };
  }
}
