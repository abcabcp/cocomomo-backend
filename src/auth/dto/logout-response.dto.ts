import { ApiProperty } from "@nestjs/swagger";

export class LogoutResponseDto {
  @ApiProperty({
    example: true,
    description: "로그아웃 성공 여부",
  })
  success: boolean;

  @ApiProperty({
    example: "로그아웃 되었습니다",
    description: "로그아웃 메시지",
  })
  message: string;

  @ApiProperty({
    example: "2025-07-10T10:36:56.567Z",
    description: "로그아웃 시간",
  })
  timestamp: string;
}
