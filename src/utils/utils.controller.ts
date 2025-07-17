import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import {
  ApiForbiddenDecorator,
  ApiNotFoundDecorator,
  ApiUnauthorizedDecorator,
} from "src/common/decorators/api-responses.decorator";
import { ApiSuccessResponse } from "src/common/decorators/api-swagger.decorator";
import { UserRole } from "src/users/entities/user.entity";
import {
  UploadImageDto,
  UploadImageRequestDto,
  UploadImagesDto,
  UploadImagesRequestDto,
} from "./dto/upload-image.dto";
import { UtilsService } from "./utils.service";
import { DeleteImageDto } from "./dto/delete-image.dto";
import { CloudinaryService } from "src/common/cloudinary/cloudinary.service";

@ApiTags("utils")
@Controller("utils")
@ApiSecurity("access-token")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UtilsController {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @ApiOperation({ summary: "이미지들 등록" })
  @ApiSuccessResponse(UploadImagesDto)
  @ApiNotFoundDecorator()
  @ApiUnauthorizedDecorator()
  @ApiForbiddenDecorator()
  @ApiSecurity("access-token")
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: "folder", required: false, type: String })
  @ApiBody({ type: UploadImagesRequestDto })
  @Post("/images")
  @UseInterceptors(FilesInterceptor("images"))
  async addImages(
    @UploadedFiles() images?: Express.Multer.File[],
    @Query("folder") folder?: string,
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException("이미지 파일이 필요합니다");
    }
    return this.utilsService.addImages(images, folder);
  }

  @ApiOperation({ summary: "단건 이미지 등록" })
  @ApiSuccessResponse(UploadImageDto)
  @ApiNotFoundDecorator()
  @ApiUnauthorizedDecorator()
  @ApiForbiddenDecorator()
  @ApiSecurity("access-token")
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: "folder", required: false, type: String })
  @ApiBody({
    type: UploadImageRequestDto,
  })
  @Post("/image")
  @UseInterceptors(FileInterceptor("image"))
  async addImage(@UploadedFile() image?: Express.Multer.File, @Query("folder") folder?: string) {
    if (!image) {
      throw new BadRequestException("이미지 파일이 필요합니다");
    }
    return this.utilsService.addImage(image, folder);
  }

  @ApiOperation({ summary: "이미지 삭제" })
  @ApiSuccessResponse(DeleteImageDto)
  @ApiNotFoundDecorator()
  @ApiUnauthorizedDecorator()
  @ApiForbiddenDecorator()
  @ApiSecurity("access-token")
  @Delete("/image")
  async deleteImageByUrl(@Query("imageUrl") imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException("이미지 URL이 필요합니다");
    }

    const publicId = this.cloudinaryService.extractPublicId(imageUrl);
    if (!publicId) {
      throw new BadRequestException("유효하지 않은 Cloudinary 이미지 URL입니다");
    }
    await this.cloudinaryService.deleteImage(publicId);
    return { imageUrl };
  }
}
