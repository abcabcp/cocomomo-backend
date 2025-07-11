import { ApiProperty } from "@nestjs/swagger";

export class ApiErrorDto {
  @ApiProperty({ example: 400 })
  result: number;

  @ApiProperty({ example: "에러 메시지" })
  message: string;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  timestamp: string;

  @ApiProperty({ example: "/api/path", required: false })
  path?: string;

  @ApiProperty({ type: Object, required: false })
  errors?: Record<string, string[]>;
}
