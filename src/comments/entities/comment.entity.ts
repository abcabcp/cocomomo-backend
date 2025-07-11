import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/entities/user.entity";
import { PostDto } from "../../posts/entities/post.entity";

@Entity()
export class Comment {
  @ApiProperty({ description: "댓글 ID (자동생성)", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "댓글 내용", example: "좋은 게시글이네요!" })
  @Column({ type: "text" })
  content: string;

  @ApiProperty({ description: "작성자 ID", example: 1 })
  @Column()
  userId: number;

  @ApiProperty({ description: "게시글 ID", example: 1 })
  @Column()
  postId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => PostDto, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post: PostDto;

  @ApiProperty({ description: "댓글 생성 시간", example: "2025-06-09T13:30:51+09:00" })
  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ApiProperty({ description: "댓글 수정 시간", example: "2025-06-09T13:30:51+09:00" })
  @Column({ default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
