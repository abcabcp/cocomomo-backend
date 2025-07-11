import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class ApiResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    type: "object",
    additionalProperties: true,
  })
  @Type(() => Object)
  data?: T;

  @ApiProperty({ example: "2025-07-11T11:55:00.000Z" })
  timestamp: string;
}
