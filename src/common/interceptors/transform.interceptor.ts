import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ApiResponseDto } from "../dto/api-response.dto";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
      catchError((err) =>
        throwError(() => ({
          statusCode: err.status || 500,
          success: false,
          data: err.message,
          timestamp: new Date().toISOString(),
        })),
      ),
    );
  }
}
