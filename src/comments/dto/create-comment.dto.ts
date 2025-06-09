import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCommentDto {
  @ApiProperty({
    description: "댓글 내용",
    example: "좋은 글이네요!",
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: "댓글 내용은 필수입니다." })
  @MaxLength(1000, { message: "댓글 내용은 1000자를 초과할 수 없습니다." })
  content: string;
}
