import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "src/users/entities/user.entity";

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    id: number;
    platformId: number;
    name: string;
    image?: string;
    role: UserRole;
  };
}

export class LoginRequestDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ enum: ["github"] })
  platform: string;
}
