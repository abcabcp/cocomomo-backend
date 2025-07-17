import { ApiProperty } from "@nestjs/swagger";

export class DeleteImageDto {
  @ApiProperty({
    description: "삭제된 이미지 URL",
    example: "https://res.cloudinary.com/your-cloud-name/image/upload/v1633072800/your-image.jpg",
    required: true,
  })
  imageUrl: string;
}
