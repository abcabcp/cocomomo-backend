import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CloudinaryService } from "../common/cloudinary/cloudinary.service";
import {
  ApiBadRequestDecorator,
  ApiErrorResponseDecorator,
  ApiNotFoundDecorator,
  ApiOkResponseDecorator,
} from "../common/decorators/api-responses.decorator";
import { UserRole } from "../users/entities/user.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { FindAllPostsDto, PostsResponseDto } from "./dto/find-all-posts.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { Post as PostEntity } from "./entities/post.entity";
import { PostsService } from "./posts.service";

@ApiTags("posts")
@Controller("posts")
@ApiErrorResponseDecorator()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @ApiOperation({
    summary: "게시글 목록 조회",
    description: "게시글 목록을 조회합니다. 검색, 필터링, 페이징 기능을 제공합니다.",
  })
  @ApiOkResponseDecorator({
    description: "게시글 목록 및 전체 개수를 반환합니다.",
    type: PostsResponseDto,
  })
  @ApiBadRequestDecorator("잘못된 요청 파라미터입니다.")
  @ApiQuery({ name: "searchTerm", required: false, description: "검색어 (제목, 내용)" })
  @ApiQuery({ name: "tags", required: false, description: "태그 필터 (쉼표로 구분 가능)" })
  @ApiQuery({
    name: "pageIndex",
    required: false,
    description: "페이지 인덱스 (0부터 시작)",
    type: Number,
  })
  @ApiQuery({ name: "pageSize", required: false, description: "페이지 크기", type: Number })
  @Get()
  async findAll(@Query() findAllPostsDto: FindAllPostsDto): Promise<PostsResponseDto> {
    return this.postsService.findAll(findAllPostsDto);
  }

  @ApiOperation({ summary: "게시글 조회", description: "ID로 특정 게시글을 조회합니다." })
  @ApiParam({ name: "id", description: "게시글 ID", type: "number" })
  @ApiOkResponseDecorator({ description: "게시글 정보를 반환합니다.", type: PostEntity })
  @ApiNotFoundDecorator("게시글을 찾을 수 없습니다.")
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<PostEntity> {
    try {
      return await this.postsService.findOne(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  @ApiOperation({
    summary: "게시글 생성",
    description: "새로운 게시글을 생성합니다. 썸네일 이미지 업로드 가능.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "게시글 제목",
          example: "안녕하세요, 첫 번째 게시글입니다",
        },
        content: {
          type: "string",
          description: "게시글 내용 (마크다운 지원)",
          example: "# 제목\n\n본문 내용은 마크다운을 지원합니다.\n\n- 목록 항목 1\n- 목록 항목 2",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "게시글 태그 목록",
          example: ["태그1", "태그2", "태그3"],
        },
        thumbnail: {
          type: "string",
          format: "binary",
          description: "썸네일 이미지 파일 (jpg, jpeg, png, webp, gif)",
        },
      },
      required: ["title", "content"],
    },
  })
  @ApiResponse({ status: 201, description: "생성된 게시글 정보를 반환합니다.", type: PostEntity })
  @ApiBadRequestDecorator("게시글 생성에 실패했습니다.")
  @Post()
  @UseInterceptors(FileInterceptor("thumbnail"))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<PostEntity> {
    try {
      let thumbnailUrl: string | undefined;

      if (file) {
        thumbnailUrl = await this.cloudinaryService.uploadImage(file);
      }

      const postData: Partial<PostEntity> = {
        title: createPostDto.title,
        content: createPostDto.content,
        thumbnailUrl,
        tags: createPostDto.tags,
      };

      return await this.postsService.create(postData);
    } catch (error) {
      console.error("게시글 생성 중 오류 발생:", error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("게시글을 생성할 수 없습니다.");
    }
  }

  @ApiOperation({
    summary: "게시글 수정",
    description: "기존 게시글을 수정합니다. 썸네일 이미지도 변경 가능합니다.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: "id", description: "수정할 게시글 ID", type: "number" })
  @ApiOkResponseDecorator({ description: "수정된 게시글 정보를 반환합니다.", type: PostEntity })
  @ApiBadRequestDecorator("게시글 수정에 실패했습니다.")
  @ApiNotFoundDecorator("게시글을 찾을 수 없습니다.")
  @Put(":id")
  @UseInterceptors(FileInterceptor("thumbnail"))
  async updatePost(
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<PostEntity> {
    try {
      const existingPost = await this.postsService.findOne(+id);
      let thumbnailUrl = existingPost.thumbnailUrl;

      if (file) {
        if (existingPost.thumbnailUrl) {
          const publicId = this.cloudinaryService.extractPublicId(existingPost.thumbnailUrl);
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        }

        thumbnailUrl = await this.cloudinaryService.uploadImage(file);
      }

      const postData: Partial<PostEntity> = {
        title: updatePostDto.title,
        content: updatePostDto.content,
        thumbnailUrl,
        tags: updatePostDto.tags,
      };

      return await this.postsService.update(+id, postData);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update post with ID ${id}`);
    }
  }

  @ApiOperation({ summary: "게시글 삭제", description: "게시글과 연관된 이미지를 삭제합니다." })
  @ApiParam({ name: "id", description: "게시글 ID", type: "number" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiResponse({ status: 204, description: "게시글이 성공적으로 삭제되었습니다." })
  @ApiBadRequestDecorator("게시글 삭제에 실패했습니다.")
  @ApiNotFoundDecorator("게시글을 찾을 수 없습니다.")
  @Delete(":id")
  @HttpCode(204)
  async deletePost(@Param("id") id: string): Promise<void> {
    try {
      const post = await this.postsService.findOne(+id);
      if (post.thumbnailUrl) {
        const publicId = this.cloudinaryService.extractPublicId(post.thumbnailUrl);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }
      await this.postsService.remove(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete post with ID ${id}`);
    }
  }

  @ApiOperation({
    summary: "에디터 이미지 업로드",
    description:
      "게시글 에디터에서 사용할 이미지를 업로드합니다. 허용된 이미지 타입: jpg, png, webp, gif, jpeg",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiResponse({
    status: 201,
    description: "이미지 업로드 성공",
    schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "업로드된 이미지 URL",
          example:
            "https://res.cloudinary.com/demo/image/upload/v1123456789/post_content_images/sample.jpg",
        },
      },
    },
  })
  @ApiBadRequestDecorator("이미지 업로드 실패 또는 유효하지 않은 이미지 형식")
  @Post("upload-image")
  @UseInterceptors(FileInterceptor("image"))
  async uploadContentImage(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException("이미지 파일이 없습니다.");
    }

    try {
      const imageUrl = await this.cloudinaryService.uploadContentImage(file);
      return { url: imageUrl };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("이미지 업로드에 실패했습니다.");
    }
  }
}
