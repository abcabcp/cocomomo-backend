import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  ApiBadRequestDecorator,
  ApiUnauthorizedDecorator,
  ApiForbiddenDecorator,
  ApiNotFoundDecorator,
} from "../common/decorators/api-responses.decorator";
import { ApiSuccessResponse } from "../common/decorators/api-swagger.decorator";
import { User, UserRole } from "../users/entities/user.entity";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostDto, PostRemoveResponseDto } from "./entities/post.entity";
import { Roles } from "src/auth/decorators/roles.decorator";
import { PostsResponseDto } from "./dto/find-all-posts.dto";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: "게시글 목록 조회" })
  @ApiSuccessResponse(PostsResponseDto)
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "searchTerm", required: false, type: String })
  @ApiQuery({ name: "tags", required: false, type: String })
  @Get()
  async findAll(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("searchTerm") searchTerm = "",
    @Query("tags") tags = "",
  ): Promise<PostsResponseDto> {
    const { list, totalCount } = await this.postsService.findAll(page, limit, searchTerm, tags);
    return {
      list,
      totalCount,
    };
  }

  @ApiOperation({ summary: "게시글 상세 조회" })
  @ApiSuccessResponse(PostDto)
  @ApiNotFoundDecorator()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.postsService.findOne(+id);
  }

  @ApiOperation({ summary: "게시글 생성" })
  @ApiSuccessResponse(PostDto)
  @ApiBadRequestDecorator()
  @ApiUnauthorizedDecorator()
  @ApiForbiddenDecorator()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request & { user: User },
  ): Promise<PostDto> {
    if (!req.user?.id) {
      throw new UnauthorizedException("User not authenticated");
    }

    return this.postsService.create({
      ...createPostDto,
    });
  }

  @ApiOperation({ summary: "게시글 수정" })
  @ApiSuccessResponse(PostDto)
  @ApiBadRequestDecorator()
  @ApiNotFoundDecorator()
  @ApiUnauthorizedDecorator()
  @ApiForbiddenDecorator()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Put(":id")
  async update(@Param("id") id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @ApiOperation({ summary: "게시글 삭제" })
  @ApiSuccessResponse(PostRemoveResponseDto)
  @ApiNotFoundDecorator()
  @ApiUnauthorizedDecorator()
  @ApiForbiddenDecorator()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: Request & { user: User }) {
    await this.postsService.remove(+id, req.user);
    return { id: +id };
  }
}
