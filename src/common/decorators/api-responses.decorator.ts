import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { ApiErrorResponseDto } from "../dto/api-error.dto";
import { HTTP_STATUS } from "../constants/error-codes.constants";

interface ApiOkResponseOptions {
  status?: number;
  description?: string;
  type?: any;
  isArray?: boolean;
}

export function ApiOkResponseDecorator(options: ApiOkResponseOptions = {}) {
  const {
    status = HTTP_STATUS.OK,
    description = "요청이 성공적으로 처리되었습니다",
    type,
    isArray = false,
  } = options;

  return applyDecorators(
    ApiResponse({
      status,
      description,
      type: type,
      isArray,
    }),
  );
}

export function ApiCreatedResponseDecorator(options: ApiOkResponseOptions = {}) {
  return ApiOkResponseDecorator({
    status: HTTP_STATUS.CREATED,
    description: "리소스가 성공적으로 생성되었습니다",
    ...options,
  });
}

export function ApiNoContentResponseDecorator(description: string = "처리가 완료되었습니다") {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.NO_CONTENT,
      description,
    }),
  );
}

export function ApiCommonErrorsDecorator() {
  return applyDecorators(
    ApiBadRequestDecorator(),
    ApiUnauthorizedDecorator(),
    ApiForbiddenDecorator(),
  );
}

export function ApiAuthErrorsDecorator() {
  return applyDecorators(ApiUnauthorizedDecorator(), ApiForbiddenDecorator());
}

export function ApiBadRequestDecorator(description: string = "잘못된 요청입니다") {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.BAD_REQUEST,
      description,
      type: ApiErrorResponseDto,
    }),
  );
}

export function ApiUnauthorizedDecorator(description: string = "인증에 실패했습니다") {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.UNAUTHORIZED,
      description,
      type: ApiErrorResponseDto,
    }),
  );
}

export function ApiForbiddenDecorator(description: string = "권한이 없습니다") {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.FORBIDDEN,
      description,
      type: ApiErrorResponseDto,
    }),
  );
}

export function ApiNotFoundDecorator(description: string = "리소스를 찾을 수 없습니다") {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.NOT_FOUND,
      description,
      type: ApiErrorResponseDto,
    }),
  );
}

// 모든 API 엔드포인트에 대한 오류 응답 타입을 정의하는 데코레이터
export function ApiErrorResponseDecorator() {
  return applyDecorators(
    ApiBadRequestDecorator(),
    ApiUnauthorizedDecorator(),
    ApiForbiddenDecorator(),
    ApiNotFoundDecorator(),
  );
}
