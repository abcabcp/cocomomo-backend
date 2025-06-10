import { ApiProperty } from "@nestjs/swagger";

export class ApiErrorResponseDto {
  @ApiProperty({
    description: "에러 코드",
    type: "number",
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: "에러 메시지",
    type: "string",
    example: "잘못된 요청입니다",
  })
  message: string;

  @ApiProperty({
    description: "에러 타입",
    type: "string",
    example: "BadRequestException",
  })
  error?: string;
}
