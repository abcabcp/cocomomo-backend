import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UploadImagesDto {
  @ApiProperty({
    description: "업로드된 이미지 URL 배열",
    type: [String],
    example: [
      "https://res.cloudinary.com/your-cloud-name/image/upload/v1633072800/your-image1.jpg",
      "https://res.cloudinary.com/your-cloud-name/image/upload/v1633072800/your-image2.jpg",
    ],
  })
  imageUrls: string[];
}

export class UploadImageDto {
  @ApiProperty({
    description: "업로드된 이미지 URL",
    type: String,
    example: "https://res.cloudinary.com/your-cloud-name/image/upload/v1633072800/your-image.jpg",
  })
  imageUrl: string;
}

export class UploadImagesRequestDto {
  @ApiProperty({
    description: "이미지 파일들",
    type: "array",
    items: {
      type: "string",
      format: "binary",
    },
  })
  @IsOptional()
  images?: Express.Multer.File[];
}

export class UploadImageRequestDto {
  @ApiProperty({
    description: "이미지 파일",
    type: "string",
    format: "binary",
  })
  @IsOptional()
  image?: Express.Multer.File;
}
