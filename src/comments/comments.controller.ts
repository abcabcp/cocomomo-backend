import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ERROR_MESSAGES } from "../common/constants/error-codes.constants";
import {
  ApiAuthErrorsDecorator,
  ApiBadRequestDecorator,
  ApiCreatedResponseDecorator,
  ApiNotFoundDecorator,
  ApiOkResponseDecorator,
} from "../common/decorators/api-responses.decorator";
import { UserRole } from "../users/entities/user.entity";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CommentResponseDto } from "./dto/comment-response.dto";
import { DeleteCommentResponseDto } from "./dto/delete-comment-response.dto";

@ApiTags("comments")
@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({
    summary: "게시글의 모든 댓글 조회",
    description: "특정 게시글에 달린 모든 댓글을 조회합니다.",
  })
  @ApiParam({ name: "postId", description: "게시글 ID", type: "number" })
  @ApiOkResponseDecorator({
    description: "댓글 목록 반환",
    type: CommentResponseDto,
    isArray: true,
  })
  @ApiNotFoundDecorator(ERROR_MESSAGES.POST_NOT_FOUND)
  @Get("post/:postId")
  async findAllByPostId(@Param("postId") postId: string): Promise<CommentResponseDto[]> {
    const comments = await this.commentsService.findAllByPostId(+postId);
    return comments.map((comment) => CommentResponseDto.fromEntity(comment));
  }

  @ApiOperation({
    summary: "댓글 작성",
    description: "게시글에 댓글을 작성합니다. 로그인이 필요합니다.",
  })
  @ApiParam({ name: "postId", description: "게시글 ID", type: "number" })
  @ApiCreatedResponseDecorator({
    description: "댓글 작성 성공",
    type: CommentResponseDto,
  })
  @ApiBadRequestDecorator(ERROR_MESSAGES.COMMENT_CREATE_FAILED)
  @ApiNotFoundDecorator(ERROR_MESSAGES.POST_NOT_FOUND)
  @ApiAuthErrorsDecorator()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post("post/:postId")
  async create(
    @Param("postId") postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ): Promise<CommentResponseDto> {
    const { content } = createCommentDto;
    const userId = req.user.id;

    const comment = await this.commentsService.create(+postId, content, userId);
    return CommentResponseDto.fromEntity(comment);
  }

  @ApiOperation({
    summary: "댓글 수정",
    description: "자신이 작성한 댓글을 수정합니다. 로그인이 필요합니다.",
  })
  @ApiParam({ name: "id", description: "댓글 ID", type: "number" })
  @ApiOkResponseDecorator({ description: "댓글 수정 성공", type: CommentResponseDto })
  @ApiBadRequestDecorator(ERROR_MESSAGES.COMMENT_UPDATE_FAILED)
  @ApiNotFoundDecorator(ERROR_MESSAGES.COMMENT_NOT_FOUND)
  @ApiAuthErrorsDecorator()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ): Promise<CommentResponseDto> {
    const { content } = updateCommentDto;
    const comment = await this.commentsService.update(+id, content, req.user);
    return CommentResponseDto.fromEntity(comment);
  }

  @ApiOperation({
    summary: "댓글 삭제",
    description: "자신이 작성한 댓글을 삭제합니다. 로그인이 필요합니다.",
  })
  @ApiParam({ name: "id", description: "댓글 ID", type: "number" })
  @ApiOkResponseDecorator({
    description: "댓글 삭제 성공",
    type: DeleteCommentResponseDto,
  })
  @ApiBadRequestDecorator(ERROR_MESSAGES.COMMENT_DELETE_FAILED)
  @ApiNotFoundDecorator(ERROR_MESSAGES.COMMENT_NOT_FOUND)
  @ApiAuthErrorsDecorator()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req): Promise<DeleteCommentResponseDto> {
    await this.commentsService.remove(+id, req.user);
    return { success: true };
  }
}
