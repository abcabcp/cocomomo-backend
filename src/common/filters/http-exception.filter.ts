import { type ExceptionFilter, Catch, type ArgumentsHost, HttpException } from "@nestjs/common";
import type { Response } from "express";
import { errorResponse } from "../dto/api-response.dto";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as string | { message: string | string[] };

    let errorMessage: string;
    if (typeof exceptionResponse === "string") {
      errorMessage = exceptionResponse;
    } else if (typeof exceptionResponse.message === "string") {
      errorMessage = exceptionResponse.message;
    } else if (Array.isArray(exceptionResponse.message)) {
      errorMessage = exceptionResponse.message.join(", ");
    } else {
      errorMessage = "오류가 발생했습니다";
    }
    const errorObj = errorResponse(status, errorMessage);

    response.status(status).json(errorObj);
  }
}
