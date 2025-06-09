import { Injectable, BadRequestException } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

@Injectable()
export class CloudinaryService {
  private readonly ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  validateImageType(file: Express.Multer.File): void {
    if (!file || !this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `지원되지 않는 이미지 형식입니다. 지원되는 형식: ${this.ALLOWED_IMAGE_TYPES.join(", ")}`,
      );
    }
  }
  async uploadImage(file: Express.Multer.File, folder = "post_thumbnails"): Promise<string> {
    this.validateImageType(file);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      });

      const buffer = Buffer.from(file.buffer);
      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
  async uploadContentImage(file: Express.Multer.File): Promise<string> {
    this.validateImageType(file);

    return this.uploadImage(file, "post_content_images");
  }
  async deleteImage(publicId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.result === "ok");
      });
    });
  }
  extractPublicId(url: string): string {
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : "";
  }
}
