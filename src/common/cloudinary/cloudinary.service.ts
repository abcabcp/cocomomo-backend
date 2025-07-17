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
  async uploadImage(file: Express.Multer.File, folder = "common"): Promise<string> {
    this.validateImageType(file);

    const originalFilename = file.originalname.split(".").slice(0, -1).join(".");
    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9]/g, "_");

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: sanitizedFilename,
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        },
      );

      const buffer = Buffer.from(file.buffer);
      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
  async uploadMultipleImages(files: Express.Multer.File[], folder = "common"): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException("이미지 파일이 필요합니다");
    }

    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
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
