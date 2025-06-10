import { ApiProperty } from "@nestjs/swagger";

export class DeleteCommentResponseDto {
  @ApiProperty({
    description: "삭제 성공 여부",
    type: "boolean",
    example: true,
  })
  success: boolean;
}
