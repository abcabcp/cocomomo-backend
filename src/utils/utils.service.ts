import { BadRequestException, Injectable } from "@nestjs/common";
import { CloudinaryService } from "src/common/cloudinary/cloudinary.service";

@Injectable()
export class UtilsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  async addImage(image?: Express.Multer.File, folder?: string) {
    if (!image) {
      throw new BadRequestException("Image is required");
    }
    const imageUrl = await this.cloudinaryService.uploadImage(image, folder);
    return { imageUrl };
  }

  async addImages(images?: Express.Multer.File[], folder?: string) {
    if (!images) {
      throw new BadRequestException("Images are required");
    }
    const imageUrls = await Promise.all(
      images.map((image) => this.cloudinaryService.uploadImage(image, folder)),
    );
    return { imageUrls };
  }

  async deleteImage(publicId: string) {
    return this.cloudinaryService.deleteImage(publicId);
  }
}
