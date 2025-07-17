import { IsString, IsOptional, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({
    description: "게시글 제목",
    example: "안녕하세요 첫 게시글입니다",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "게시글 본문 내용",
    example: "이것은 게시글의 본문 내용입니다. 마크다운을 지원합니다.",
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: "게시글 태그 목록",
    example: "일상,여행,취미",
    required: false,
    type: String,
  })
  @IsOptional()
  tags?: string[];
  @ApiProperty({
    description: "게시글 썸네일 이미지 파일",
    type: "string",
    format: "binary",
    required: false,
  })
  @IsOptional()
  thumbnail?: Express.Multer.File;
}
