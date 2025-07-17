import { IsString, IsOptional, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePostDto {
  @ApiProperty({
    description: "게시글 제목",
    example: "수정된 게시글 제목입니다",
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: "게시글 본문 내용",
    example: "이것은 수정된 게시글의 본문 내용입니다.",
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: "게시글 태그 목록",
    example: "수정됨,업데이트",
    required: false,
    type: String,
  })
  @IsArray()
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

export class UpdatePostImageDto {
  @ApiProperty({
    description: "게시글 이미지 파일들",
    type: "array",
    items: {
      type: "string",
      format: "binary",
    },
  })
  @IsOptional()
  image?: Express.Multer.File[];
}
