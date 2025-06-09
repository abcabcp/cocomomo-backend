import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { Comment } from "./entities/comment.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@ApiTags("댓글")
@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({
    summary: "게시글의 모든 댓글 조회",
    description: "특정 게시글에 달린 모든 댓글을 조회합니다.",
  })
  @ApiParam({ name: "postId", description: "게시글 ID", type: "number" })
  @ApiResponse({ status: 200, description: "댓글 목록 반환" })
  @Get("post/:postId")
  async findAllByPostId(@Param("postId") postId: string): Promise<Comment[]> {
    return this.commentsService.findAllByPostId(+postId);
  }

  @ApiOperation({
    summary: "댓글 작성",
    description: "게시글에 댓글을 작성합니다. 로그인이 필요합니다.",
  })
  @ApiParam({ name: "postId", description: "게시글 ID", type: "number" })
  @ApiResponse({ status: 201, description: "댓글 작성 성공", type: Comment })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post("post/:postId")
  async create(
    @Param("postId") postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ): Promise<Comment> {
    const { content } = createCommentDto;
    const userId = req.user.id;

    return this.commentsService.create(+postId, content, userId);
  }

  @ApiOperation({
    summary: "댓글 수정",
    description: "자신이 작성한 댓글을 수정합니다. 로그인이 필요합니다.",
  })
  @ApiParam({ name: "id", description: "댓글 ID", type: "number" })
  @ApiResponse({ status: 200, description: "댓글 수정 성공", type: Comment })
  @ApiResponse({ status: 403, description: "댓글 수정 권한이 없습니다." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ): Promise<Comment> {
    const { content } = updateCommentDto;
    return this.commentsService.update(+id, content, req.user);
  }

  @ApiOperation({
    summary: "댓글 삭제",
    description: "자신이 작성한 댓글을 삭제합니다. 로그인이 필요합니다.",
  })
  @ApiParam({ name: "id", description: "댓글 ID", type: "number" })
  @ApiResponse({ status: 200, description: "댓글 삭제 성공" })
  @ApiResponse({ status: 403, description: "댓글 삭제 권한이 없습니다." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req): Promise<{ success: boolean }> {
    await this.commentsService.remove(+id, req.user);
    return { success: true };
  }
}
