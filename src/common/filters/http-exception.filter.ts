import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { Request, Response } from "express";
import { ApiErrorDto } from "../dto/api-error.dto";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ApiErrorDto = {
      result: status,
      message: this.getErrorMessage(exceptionResponse),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (
      typeof exceptionResponse === "object" &&
      exceptionResponse !== null &&
      "errors" in exceptionResponse
    ) {
      const errors = exceptionResponse.errors;
      if (this.isValidErrorsObject(errors)) {
        errorResponse.errors = errors;
      }
    }

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(response: unknown): string {
    if (typeof response === "string") return response;
    if (typeof response === "object" && response !== null) {
      const res = response as Record<string, unknown>;
      if (typeof res.message === "string") return res.message;
      if (Array.isArray(res.message)) return res.message.join(", ");
    }
    return "오류가 발생했습니다";
  }

  private isValidErrorsObject(obj: unknown): obj is Record<string, string[]> {
    if (typeof obj !== "object" || obj === null) return false;
    return Object.values(obj).every(
      (value) => Array.isArray(value) && value.every((item) => typeof item === "string"),
    );
  }
}
