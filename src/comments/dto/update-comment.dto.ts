import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateCommentDto {
  @ApiProperty({
    description: "댓글 내용",
    example: "수정된 댓글입니다.",
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: "댓글 내용은 필수입니다." })
  @MaxLength(1000, { message: "댓글 내용은 1000자를 초과할 수 없습니다." })
  content: string;
}
