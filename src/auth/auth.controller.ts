import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

@ApiTags("인증")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: "GitHub 로그인 시작",
    description: "GitHub OAuth 인증 페이지로 리다이렉트합니다.",
  })
  @Get("github")
  @UseGuards(AuthGuard("github"))
  githubAuth() {}

  @ApiOperation({
    summary: "GitHub 로그인 콜백",
    description: "GitHub 인증 후 처리되는 콜백 엔드포인트입니다.",
  })
  @ApiResponse({
    status: 200,
    description: "로그인 성공 시 프론트엔드로 리다이렉트됩니다.",
  })
  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const loginResult = await this.authService.login(req.user);
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    const token = loginResult.accessToken;

    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}
