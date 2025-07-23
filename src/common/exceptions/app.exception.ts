import { HttpException } from "@nestjs/common";
import { ERROR_MESSAGES, ERROR_CODES } from "../constants/error-codes.constants";

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export class AppException extends HttpException {
  private readonly errorCode: string;

  constructor(errorCode: keyof typeof ERROR_MESSAGES, statusCode?: number, customMessage?: string) {
    const message = customMessage || ERROR_MESSAGES[errorCode] || "오류가 발생했습니다";
    const status = statusCode || ERROR_CODES[errorCode] || ERROR_CODES.BAD_REQUEST;

    super(
      {
        statusCode: status,
        message,
        error: errorCode,
      },
      status,
    );

    this.errorCode = errorCode;
  }

  getErrorCode(): string {
    return this.errorCode;
  }
}
