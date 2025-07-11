import { ApiResponseDto } from "./api-response.dto";

export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  total: number;
  page: number;
  limit: number;
}
