import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class PostDto {
  @ApiProperty({ description: "게시글 ID (자동생성)", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "게시글 제목", example: "안녕하세요 첫 게시글입니다" })
  @Column()
  title: string;

  @ApiProperty({
    description: "게시글 본문 내용 (마크다운 지원)",
    example:
      "이것은 게시글의 본문 내용입니다. **마크다운**을 지원하며 이미지를 포함할 수 있습니다.",
  })
  @Column({ type: "text", nullable: true })
  content: string;

  @ApiProperty({
    description: "썸네일 이미지 URL",
    example: "https://res.cloudinary.com/demo/image/upload/v1123456789/sample.jpg",
    required: false,
  })
  @Column({ nullable: true })
  thumbnailUrl: string;

  @ApiProperty({
    description: "게시글 태그 목록",
    example: "일상,여행,취미",
    required: false,
  })
  @Column("simple-array", { nullable: true })
  tags: string[];

  @ApiProperty({ description: "게시글 생성 시간", example: "2025-06-09T13:30:51+09:00" })
  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ApiProperty({ description: "게시글 수정 시간", example: "2025-06-09T13:30:51+09:00" })
  @Column({ default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}

export class PostRemoveResponseDto {
  @ApiProperty({ description: "삭제된 게시글 ID", example: 1 })
  id: number;
}
