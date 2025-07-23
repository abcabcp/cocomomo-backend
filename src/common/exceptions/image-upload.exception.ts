import { ERROR_KEYS } from "../constants/error-codes.constants";
import { AppException } from "./app.exception";

export class ImageUploadException extends AppException {
  constructor() {
    super(ERROR_KEYS.IMAGE_UPLOAD_FAILED);
  }
  static imageRequired() {
    return new AppException(ERROR_KEYS.IMAGE_REQUIRED);
  }

  static unsupportedFormat() {
    return new AppException(ERROR_KEYS.UNSUPPORTED_IMAGE_FORMAT);
  }

  static tooLarge() {
    return new AppException(ERROR_KEYS.IMAGE_TOO_LARGE);
  }

  static uploadFailed(message?: string) {
    return new AppException(
      ERROR_KEYS.IMAGE_UPLOAD_FAILED,
      undefined,
      message ? `${message}` : undefined,
    );
  }
}
