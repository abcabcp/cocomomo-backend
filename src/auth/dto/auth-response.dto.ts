import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../users/entities/user.entity";

class UserResponse {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 12345 })
  platformId: number;

  @ApiProperty({ example: "User Name" })
  name: string;

  @ApiProperty({ example: "user@example.com" })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}
