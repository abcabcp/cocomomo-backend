import { Controller, Get, Req, UnauthorizedException, UseGuards } from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import {
  ApiCommonErrorsDecorator,
  ApiSuccessResponse,
} from "src/common/decorators/api-responses.decorator";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiOperation({
    summary: "현재 사용자 GitHub 정보 조회",
    description: "액세스 토큰으로 인증된 사용자의 GitHub 정보를 반환합니다.",
  })
  @ApiCommonErrorsDecorator()
  @ApiSecurity("access-token")
  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  async getProfile(githubToken: string): Promise<User> {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!response.ok) {
      throw new UnauthorizedException("GitHub 프로필을 가져오지 못했습니다");
    }

    const profile = await response.json();
    const name = profile.name || profile.login || `user_${profile.id}`;

    return {
      id: profile.id,
      name,
      email: profile.email || "",
      platformId: profile.id,
      role: profile.role,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  @ApiSuccessResponse(User)
  @ApiCommonErrorsDecorator()
  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiSecurity("access-token")
  async getCurrentUser(@Req() req: Request & { user: User }): Promise<User> {
    return this.usersService.findById(req.user.id);
  }
}
