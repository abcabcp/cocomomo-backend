import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { ApiErrorDto } from "../dto/api-error.dto";
import { ERROR_MESSAGES, ERROR_CODES, ERROR_KEYS } from "../constants/error-codes.constants";
import { AppException } from "../exceptions/app.exception";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = "서버 내부 오류가 발생했습니다";

    if (exception instanceof AppException) {
      status = exception.getStatus();
      errorMessage = exception.message;
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      status = exception.getStatus();

      if (typeof exceptionResponse === "string") {
        errorMessage = exceptionResponse;
      } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, unknown>;

        if (typeof res.message === "string") {
          errorMessage = res.message;
        } else if (Array.isArray(res.message)) {
          errorMessage = res.message.join(", ");
        }
      }
    } else {
      const customException = exception as unknown as { statusCode: number; data: string };
      if (customException.statusCode && customException.data) {
        status = customException.statusCode;
        errorMessage = customException.data;
      } else {
        errorMessage = ERROR_MESSAGES[ERROR_KEYS.IMAGE_UPLOAD_FAILED];
        status = ERROR_CODES[ERROR_KEYS.IMAGE_UPLOAD_FAILED] as HttpStatus;
      }
    }

    const errorResponse: ApiErrorDto = {
      result: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (
      exception instanceof HttpException &&
      typeof exception.getResponse() === "object" &&
      exception.getResponse() !== null
    ) {
      const res = exception.getResponse() as Record<string, unknown>;
      if ("errors" in res && this.isValidErrorsObject(res.errors)) {
        errorResponse.errors = res.errors;
      }
    }
    response.status(status).json(errorResponse);
  }

  private isValidErrorsObject(obj: unknown): obj is Record<string, string[]> {
    if (typeof obj !== "object" || obj === null) return false;
    return Object.values(obj).every(
      (value) => Array.isArray(value) && value.every((item) => typeof item === "string"),
    );
  }
}
