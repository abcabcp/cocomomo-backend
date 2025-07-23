import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiQuery, ApiSecurity, ApiTags } from "@nestjs/swagger";
import * as express from "express";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CloudinaryService } from "../common/cloudinary/cloudinary.service";
import {
  ApiCommonErrorsDecorator,
  ApiPostErrorsDecorator,
  ApiSuccessResponse,
} from "../common/decorators/api-responses.decorator";
import { PostException } from "../common/exceptions/post.exception";
import { User, UserRole } from "../users/entities/user.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostsResponseDto, PostsTagsResponseDto } from "./dto/find-all-posts.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostDto, PostRemoveResponseDto } from "./entities/post.entity";
import { PostsService } from "./posts.service";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  @ApiOperation({ summary: "게시글 태그 조회" })
  @ApiSuccessResponse(PostsTagsResponseDto)
  @Get("/tags")
  async findAllTags(): Promise<PostsTagsResponseDto> {
    const tags = await this.postsService.getAllTags();
    return { tags };
  }

  @ApiOperation({ summary: "게시글 상세 조회" })
  @ApiSuccessResponse(PostDto)
  @ApiCommonErrorsDecorator()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.postsService.findOne(+id);
  }

  @ApiOperation({ summary: "게시글 생성" })
  @ApiSuccessResponse(PostDto)
  @ApiCommonErrorsDecorator()
  @ApiPostErrorsDecorator()
  @ApiSecurity("access-token")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("thumbnail"))
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: express.Request & { user: User },
    @UploadedFile() thumbnail?: Express.Multer.File,
  ): Promise<PostDto> {
    if (!req.user?.id) {
      throw PostException.unauthorized();
    }

    let thumbnailUrl: string | undefined;
    if (thumbnail) {
      thumbnailUrl = await this.cloudinaryService.uploadImage(thumbnail);
    }

    return this.postsService.create({
      ...createPostDto,
      thumbnailUrl,
    });
  }

  @ApiOperation({ summary: "게시글 수정" })
  @ApiSuccessResponse(PostDto)
  @ApiPostErrorsDecorator()
  @ApiCommonErrorsDecorator()
  @ApiSecurity("access-token")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(":id")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("thumbnail"))
  async update(
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    let thumbnailUrl: string | undefined;
    if (thumbnail) {
      thumbnailUrl = await this.cloudinaryService.uploadImage(thumbnail);
    }

    return this.postsService.update(+id, {
      ...updatePostDto,
      thumbnailUrl,
    });
  }

  @ApiOperation({ summary: "게시글 삭제" })
  @ApiSuccessResponse(PostRemoveResponseDto)
  @ApiCommonErrorsDecorator()
  @ApiSecurity("access-token")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: express.Request & { user: User }) {
    await this.postsService.remove(+id, req.user);
    return { id: +id };
  }
}
