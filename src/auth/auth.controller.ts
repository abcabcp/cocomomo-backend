import { Body, Controller, Logger, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginRequestDto, RefreshTokenRequestDto } from "./dto/auth-request.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import {
  ApiCommonErrorsDecorator,
  ApiSuccessResponse,
} from "src/common/decorators/api-responses.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "로그인 처리",
    description: "액세스 토큰을 사용하여 사용자 인증을 처리하고 JWT 토큰을 반환합니다.",
  })
  @ApiCommonErrorsDecorator()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBody({ type: LoginRequestDto })
  @Post("login")
  @ApiSuccessResponse(AuthResponseDto)
  async login(@Body() loginDto: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.handleLogin(loginDto);
  }

  @Post("refresh")
  @ApiOperation({ summary: "액세스 토큰 갱신" })
  @ApiSuccessResponse(AuthResponseDto)
  @ApiCommonErrorsDecorator()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBody({ type: RefreshTokenRequestDto })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
