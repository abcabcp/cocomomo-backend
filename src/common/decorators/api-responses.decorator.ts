import { applyDecorators } from "@nestjs/common";
import { ApiOkResponse, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { ERROR_CODES, ERROR_KEYS, ERROR_MESSAGES } from "../constants/error-codes.constants";

export function ApiSuccessResponse(model: any) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              statusCode: { type: "number", example: 200 },
              success: { type: "boolean", example: true },
              data: { $ref: getSchemaPath(model) },
              timestamp: { type: "string", format: "date-time" },
            },
          },
        ],
      },
    }),
  );
}

export function ApiBadRequestDecorator(description = ERROR_MESSAGES[ERROR_KEYS.BAD_REQUEST]) {
  return applyDecorators(
    ApiResponse({
      status: ERROR_CODES[ERROR_KEYS.BAD_REQUEST],
      description,
      schema: {
        properties: {
          result: { type: "number", example: ERROR_CODES[ERROR_KEYS.BAD_REQUEST] },
          message: { type: "string", example: description },
          timestamp: { type: "string", example: new Date().toISOString() },
        },
      },
    }),
  );
}

export function ApiUnauthorizedDecorator(description = ERROR_MESSAGES[ERROR_KEYS.UNAUTHORIZED]) {
  return applyDecorators(
    ApiResponse({
      status: ERROR_CODES[ERROR_KEYS.UNAUTHORIZED],
      description,
      schema: {
        properties: {
          result: { type: "number", example: ERROR_CODES[ERROR_KEYS.UNAUTHORIZED] },
          message: { type: "string", example: description },
        },
      },
    }),
  );
}

export function ApiForbiddenDecorator(description = ERROR_MESSAGES[ERROR_KEYS.FORBIDDEN]) {
  return applyDecorators(
    ApiResponse({
      status: ERROR_CODES[ERROR_KEYS.FORBIDDEN],
      description,
      schema: {
        properties: {
          result: { type: "number", example: ERROR_CODES[ERROR_KEYS.FORBIDDEN] },
          message: { type: "string", example: description },
        },
      },
    }),
  );
}

export function ApiNotFoundDecorator(description = ERROR_MESSAGES[ERROR_KEYS.NOT_FOUND]) {
  return applyDecorators(
    ApiResponse({
      status: ERROR_CODES[ERROR_KEYS.NOT_FOUND],
      description,
      schema: {
        properties: {
          result: { type: "number", example: ERROR_CODES[ERROR_KEYS.NOT_FOUND] },
          message: { type: "string", example: description },
        },
      },
    }),
  );
}

export function ApiCommonErrorsDecorator() {
  return applyDecorators(
    ApiBadRequestDecorator(),
    ApiUnauthorizedDecorator(),
    ApiForbiddenDecorator(),
    ApiNotFoundDecorator(),
  );
}

export function ApiImageUploadErrorDecorator(
  description = ERROR_MESSAGES[ERROR_KEYS.IMAGE_UPLOAD_FAILED],
) {
  return applyDecorators(
    ApiResponse({
      status: ERROR_CODES[ERROR_KEYS.IMAGE_UPLOAD_FAILED],
      description,
      schema: {
        properties: {
          result: { type: "number", example: ERROR_CODES[ERROR_KEYS.IMAGE_UPLOAD_FAILED] },
          message: { type: "string", example: description },
        },
      },
    }),
  );
}

export function ApiUnsupportedImageFormatDecorator(
  description = ERROR_MESSAGES[ERROR_KEYS.UNSUPPORTED_IMAGE_FORMAT],
) {
  return applyDecorators(
    ApiResponse({
      status: ERROR_CODES[ERROR_KEYS.UNSUPPORTED_IMAGE_FORMAT],
      description,
      schema: {
        properties: {
          result: { type: "number", example: ERROR_CODES[ERROR_KEYS.UNSUPPORTED_IMAGE_FORMAT] },
          message: { type: "string", example: description },
        },
      },
    }),
  );
}

export function ApiImageTooLargeDecorator(
  description = ERROR_MESSAGES[ERROR_KEYS.IMAGE_TOO_LARGE],
) {
  return applyDecorators(
    ApiResponse({
      status: ERROR_CODES[ERROR_KEYS.IMAGE_TOO_LARGE],
      description,
      schema: {
        properties: {
          result: { type: "number", example: ERROR_CODES[ERROR_KEYS.IMAGE_TOO_LARGE] },
          message: { type: "string", example: description },
        },
      },
    }),
  );
}

export function ApiImageErrorsDecorator() {
  return applyDecorators(
    ApiImageUploadErrorDecorator(),
    ApiUnsupportedImageFormatDecorator(),
    ApiImageTooLargeDecorator(),
  );
}

export const ApiInvalidTagsDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: ERROR_CODES[ERROR_KEYS.INVALID_TAGS],
      description: ERROR_MESSAGES[ERROR_KEYS.INVALID_TAGS],
      schema: {
        properties: {
          result: { type: "number", example: ERROR_CODES[ERROR_KEYS.INVALID_TAGS] },
          message: { type: "string", example: ERROR_MESSAGES[ERROR_KEYS.INVALID_TAGS] },
        },
      },
    }),
  );
};

export const ApiMissingRequiredFieldsDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: ERROR_CODES[ERROR_KEYS.MISSING_REQUIRED_FIELDS],
      description: ERROR_MESSAGES[ERROR_KEYS.MISSING_REQUIRED_FIELDS],
      schema: {
        properties: {
          result: { type: "number", example: ERROR_CODES[ERROR_KEYS.MISSING_REQUIRED_FIELDS] },
          message: {
            type: "string",
            example: ERROR_MESSAGES[ERROR_KEYS.MISSING_REQUIRED_FIELDS],
          },
        },
      },
    }),
  );
};

export const ApiPostErrorsDecorator = () => {
  return applyDecorators(ApiInvalidTagsDecorator(), ApiMissingRequiredFieldsDecorator());
};
