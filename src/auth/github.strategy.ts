import { Injectable } from "@nestjs/common";
import { AuthStrategy } from "./auth.strategy";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";

@Injectable()
export class GithubStrategy implements AuthStrategy {
  constructor(private usersService: UsersService) {}

  async getProfile(githubToken: string): Promise<User> {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const profile = await response.json();
    return {
      id: profile.id,
      name: profile.name || profile.login,
      email: profile.email || `${profile.id}+github@example.com`,
      image: profile.image,
      platformId: profile.id,
      role: profile.role,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async validate(profile: User): Promise<User> {
    return this.usersService.validateForGithubLogin({
      platformId: profile.id,
      name: profile.name,
      email: profile.email,
      image: profile.image,
    });
  }
}
