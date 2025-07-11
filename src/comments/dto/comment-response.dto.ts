import { ApiProperty } from "@nestjs/swagger";
import { Comment } from "../entities/comment.entity";

export class CommentResponseDto {
  @ApiProperty({ description: "댓글 ID (자동생성)", example: 1 })
  id: number;

  @ApiProperty({ description: "댓글 내용", example: "좋은 게시글이네요!" })
  content: string;

  @ApiProperty({ description: "작성자 ID", example: 1 })
  userId: number;

  @ApiProperty({ description: "게시글 ID", example: 1 })
  postId: number;

  @ApiProperty({ description: "댓글 생성 시간", example: "2025-06-09T13:30:51+09:00" })
  createdAt: Date;

  @ApiProperty({ description: "댓글 수정 시간", example: "2025-06-09T13:30:51+09:00" })
  updatedAt: Date;

  @ApiProperty({ description: "작성자 정보", example: { id: 1, name: "사용자" } })
  user?: {
    id: number;
    name: string;
  };

  static fromEntity(comment: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = comment.id;
    dto.content = comment.content;
    dto.userId = comment.userId;
    dto.postId = comment.postId;
    dto.createdAt = comment.createdAt;
    dto.updatedAt = comment.updatedAt;

    if (comment.user) {
      dto.user = {
        id: comment.user.id,
        name: comment.user.name,
      };
    }

    return dto;
  }
}

export class CommentRemoveResponseDto {
  @ApiProperty({ description: "삭제 코멘트 id", example: 1 })
  id: number;
}
