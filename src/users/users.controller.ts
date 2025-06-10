import { Controller, Get, Param, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: "현재 사용자 정보 조회",
    description: "현재 로그인한 사용자의 정보를 조회합니다.",
  })
  @ApiResponse({ status: 200, description: "사용자 정보 조회 성공", type: User })
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  getProfile(@Req() req): User {
    return req.user;
  }

  @ApiOperation({
    summary: "ID로 사용자 조회",
    description: "특정 ID를 가진 사용자 정보를 조회합니다.",
  })
  @ApiResponse({ status: 200, description: "사용자 정보 조회 성공", type: User })
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<User> {
    return this.usersService.findById(+id);
  }
}
