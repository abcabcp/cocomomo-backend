import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsArray, IsString, IsNumber, Min } from "class-validator";
import { Transform, Type } from "class-transformer";

export class FindAllPostsDto {
  @ApiProperty({
    description: "검색할 키워드 (제목 및 내용에서 검색)",
    required: false,
    example: "검색어",
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({
    description: "태그 목록으로 필터링 (복수 가능)",
    required: false,
    type: [String],
    example: ["태그1", "태그2"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // 문자열로 들어온 경우 배열로 변환
    if (typeof value === "string") {
      return value.split(",").map((tag) => tag.trim());
    }
    return value;
  })
  tags?: string[];

  @ApiProperty({
    description: "페이지 번호 (0부터 시작)",
    required: false,
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  pageIndex?: number = 0;

  @ApiProperty({
    description: "페이지당 게시글 수",
    required: false,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  pageSize?: number = 10;
}

export class PostsResponseDto {
  @ApiProperty({
    description: "게시글 목록",
    type: "array",
  })
  list: any[];

  @ApiProperty({
    description: "전체 게시글 수",
    type: "number",
    example: 100,
  })
  totalCount: number;
}
