import { applyDecorators } from "@nestjs/common";
import { ApiOkResponse, getSchemaPath } from "@nestjs/swagger";

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
