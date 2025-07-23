import { Injectable } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";
import { ImageUploadException } from "../exceptions/image-upload.exception";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];
@Injectable()
export class CloudinaryService {
  validateImageType(file: Express.Multer.File): void {
    if (!file) {
      throw ImageUploadException.imageRequired();
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw ImageUploadException.unsupportedFormat();
    }
  }

  async uploadImage(file: Express.Multer.File, folder = "common"): Promise<string> {
    try {
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
            if (error || !result) {
              return reject(ImageUploadException.uploadFailed(error?.message));
            }
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
    } catch (error) {
      if (error instanceof ImageUploadException) {
        throw error;
      }
      throw ImageUploadException.uploadFailed(error.message);
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder = "common"): Promise<string[]> {
    if (!files || files.length === 0) {
      throw ImageUploadException.imageRequired();
    }

    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  async uploadContentImage(file: Express.Multer.File): Promise<string> {
    try {
      this.validateImageType(file);
      return this.uploadImage(file, "post_content_images");
    } catch (error) {
      if (error instanceof ImageUploadException) {
        throw error;
      }
      throw ImageUploadException.uploadFailed(error.message);
    }
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
