import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  ApiUnauthorizedDecorator,
  ApiForbiddenDecorator,
  ApiBadRequestDecorator,
  ApiNotFoundDecorator,
} from "../common/decorators/api-responses.decorator";
import { ApiSuccessResponse } from "../common/decorators/api-swagger.decorator";
import { UserRole } from "../users/entities/user.entity";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CommentResponseDto } from "./dto/comment-response.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { Comment } from "./entities/comment.entity";

@ApiTags("comments")
@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: "게시글 댓글 목록 조회" })
  @ApiParam({ name: "postId", type: "number" })
  @ApiSuccessResponse(CommentResponseDto)
  @ApiNotFoundDecorator()
  @Get("post/:postId")
  async getCommentsByPostId(@Param("postId") postId: string) {
    const comments = await this.commentsService.findAllByPostId(+postId);
    return comments.map((comment) => CommentResponseDto.fromEntity(comment));
  }

  @ApiOperation({ summary: "댓글 작성" })
  @ApiParam({ name: "postId", type: "number" })
  @ApiSuccessResponse(CommentResponseDto)
  @ApiBadRequestDecorator()
  @ApiNotFoundDecorator()
  @ApiUnauthorizedDecorator()
  @ApiForbiddenDecorator()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post("post/:postId")
  async create(
    @Param("postId") postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(
      +postId,
      createCommentDto.content,
      req.user.id,
    );
    return CommentResponseDto.fromEntity(comment);
  }

  @ApiOperation({ summary: "댓글 수정" })
  @ApiParam({ name: "id", type: "number" })
  @ApiSuccessResponse(CommentResponseDto)
  @ApiBadRequestDecorator()
  @ApiNotFoundDecorator()
  @ApiUnauthorizedDecorator()
  @ApiForbiddenDecorator()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.update(+id, updateCommentDto.content, req.user.id);
    return CommentResponseDto.fromEntity(comment);
  }

  @ApiOperation({ summary: "댓글 삭제" })
  @ApiParam({ name: "id", type: "number" })
  @ApiSuccessResponse(Comment)
  @ApiNotFoundDecorator()
  @ApiUnauthorizedDecorator()
  @ApiForbiddenDecorator()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Delete(":id")
  async delete(@Param("id") id: string, @Req() req): Promise<void> {
    await this.commentsService.remove(+id, req.user.id);
  }
}
