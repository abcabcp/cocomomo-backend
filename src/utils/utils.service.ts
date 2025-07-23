import { Injectable } from "@nestjs/common";
import { ALLOWED_IMAGE_TYPES, CloudinaryService } from "src/common/cloudinary/cloudinary.service";
import { ImageUploadException } from "src/common/exceptions/image-upload.exception";

@Injectable()
export class UtilsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async addImage(image?: Express.Multer.File, folder?: string) {
    if (!image) {
      throw ImageUploadException.imageRequired();
    }

    if (!ALLOWED_IMAGE_TYPES.includes(image.mimetype)) {
      throw ImageUploadException.unsupportedFormat();
    }

    const imageUrl = await this.cloudinaryService.uploadImage(image, folder);
    return { imageUrl };
  }

  async addImages(images?: Express.Multer.File[], folder?: string) {
    if (!images || images.length === 0) {
      throw ImageUploadException.imageRequired();
    }

    for (const image of images) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.mimetype)) {
        throw ImageUploadException.unsupportedFormat();
      }
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
