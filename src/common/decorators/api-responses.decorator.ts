import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { ApiErrorDto } from "../dto/api-error.dto";

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
};

export function ApiOkResponseDecorator(options: { type?: any; isArray?: boolean } = {}) {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.OK,
      description: "요청이 성공적으로 처리되었습니다",
      ...options,
    }),
  );
}

export function ApiCreatedResponseDecorator(options: { type?: any } = {}) {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.CREATED,
      description: "리소스가 성공적으로 생성되었습니다",
      ...options,
    }),
  );
}

export function ApiNoContentResponseDecorator() {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.NO_CONTENT,
      description: "처리가 완료되었습니다",
    }),
  );
}

export function ApiBadRequestDecorator(description = "잘못된 요청입니다") {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.BAD_REQUEST,
      description,
      type: ApiErrorDto,
    }),
  );
}

export function ApiUnauthorizedDecorator(description = "인증에 실패했습니다") {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.UNAUTHORIZED,
      description,
      type: ApiErrorDto,
    }),
  );
}

export function ApiForbiddenDecorator(description = "권한이 없습니다") {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.FORBIDDEN,
      description,
      type: ApiErrorDto,
    }),
  );
}

export function ApiNotFoundDecorator(description = "리소스를 찾을 수 없습니다") {
  return applyDecorators(
    ApiResponse({
      status: HTTP_STATUS.NOT_FOUND,
      description,
      type: ApiErrorDto,
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
