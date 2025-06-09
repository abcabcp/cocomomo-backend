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
    example: ["수정됨", "업데이트"],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: "썸네일 이미지 URL (파일 업로드로 자동 처리되므로 일반적으로 사용하지 않음)",
    example: "https://res.cloudinary.com/demo/image/upload/v1123456789/sample.jpg",
    required: false,
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}
