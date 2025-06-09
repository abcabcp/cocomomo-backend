import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { PostsService } from "../posts/posts.service";
import { UsersService } from "../users/users.service";
import { User, UserRole } from "../users/entities/user.entity";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private postsService: PostsService,
    private usersService: UsersService,
  ) {}

  async findAllByPostId(postId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { postId },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });
  }

  async findById(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async create(postId: number, content: string, userId: number): Promise<Comment> {
    await this.postsService.findOne(postId);
    await this.usersService.findById(userId);

    const comment = this.commentsRepository.create({
      content,
      postId,
      userId,
    });

    return this.commentsRepository.save(comment);
  }

  async update(id: number, content: string, currentUser: User): Promise<Comment> {
    const comment = await this.findById(id);
    if (comment.userId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("작성자만 댓글을 수정할 수 있습니다.");
    }

    comment.content = content;

    return this.commentsRepository.save(comment);
  }

  async remove(id: number, currentUser: User): Promise<void> {
    const comment = await this.findById(id);

    if (comment.userId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("작성자 또는 관리자만 댓글을 삭제할 수 있습니다.");
    }

    await this.commentsRepository.remove(comment);
  }
}
