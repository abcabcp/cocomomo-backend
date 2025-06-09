import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>("GITHUB_CLIENT_ID"),
      clientSecret: configService.get<string>("GITHUB_CLIENT_SECRET"),
      callbackURL: configService.get<string>("GITHUB_CALLBACK_URL"),
      scope: ["user:email"],
    });
  }

  async validate(profile: {
    id: string;
    login: string;
    emails: { value: string }[];
    photos: { value: string }[];
  }): Promise<User> {
    const { id, login, emails, photos } = profile;

    const user = {
      githubId: id,
      username: login,
      email: emails?.[0]?.value,
      avatarUrl: photos?.[0]?.value,
    };

    // 사용자를 검증하고 필요한 경우 DB에 저장
    const validatedUser = await this.authService.validateGithubUser(user);

    return validatedUser;
  }
}
