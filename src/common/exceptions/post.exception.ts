import { AppException } from "./app.exception";
import { ERROR_CODES, ERROR_KEYS, ERROR_MESSAGES } from "../constants/error-codes.constants";

export class PostException extends AppException {
  constructor() {
    super(ERROR_KEYS.POST_NOT_FOUND);
  }

  static notFound(id?: number | string) {
    return new AppException(
      ERROR_KEYS.POST_NOT_FOUND,
      ERROR_CODES[ERROR_KEYS.POST_NOT_FOUND],
      id ? `ID ${id}인 게시물을 찾을 수 없습니다` : ERROR_MESSAGES[ERROR_KEYS.POST_NOT_FOUND],
    );
  }

  static missingRequiredFields() {
    return new AppException(
      ERROR_KEYS.MISSING_REQUIRED_FIELDS,
      ERROR_CODES[ERROR_KEYS.MISSING_REQUIRED_FIELDS],
      ERROR_MESSAGES[ERROR_KEYS.MISSING_REQUIRED_FIELDS],
    );
  }

  static invalidTags() {
    return new AppException(
      ERROR_KEYS.INVALID_TAGS,
      ERROR_CODES[ERROR_KEYS.INVALID_TAGS],
      ERROR_MESSAGES[ERROR_KEYS.INVALID_TAGS],
    );
  }

  static unauthorized() {
    return new AppException(
      ERROR_KEYS.UNAUTHORIZED,
      ERROR_CODES[ERROR_KEYS.UNAUTHORIZED],
      ERROR_MESSAGES[ERROR_KEYS.UNAUTHORIZED],
    );
  }

  static forbidden() {
    return new AppException(
      ERROR_KEYS.FORBIDDEN,
      ERROR_CODES[ERROR_KEYS.FORBIDDEN],
      ERROR_MESSAGES[ERROR_KEYS.FORBIDDEN],
    );
  }
}
