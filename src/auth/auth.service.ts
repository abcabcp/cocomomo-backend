import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthStrategy } from "./auth.strategy";
import { GithubStrategy } from "./github.strategy";

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

  async refreshToken({
    platform,
    refreshToken: refresh_token,
  }: {
    platform: string;
    refreshToken: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const strategy = this.strategies[platform];
    if (!strategy) throw new Error("Unsupported platform");

    try {
      const payload = this.jwtService.verify(refresh_token);
      const user = await this.usersService.findById(payload.userId);

      if (!user) {
        throw new UnauthorizedException("유효하지 않은 사용자입니다.");
      }

      const newPayload = { userId: user.id, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      this.logger.error(`토큰 갱신 중 오류 발생: ${error.message}`);
      throw new UnauthorizedException("토큰이 만료되었거나 유효하지 않습니다.");
    }
  }
}
