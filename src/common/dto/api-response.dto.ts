// 기본 응답 인터페이스
export interface ApiResponse<T> {
  result: number;
  message: string;
  data: T;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    result: 200,
    message: "",
    data,
  };
}

export function successListResponse<T>(data: T[]): ApiResponse<T[]> {
  return {
    result: 200,
    message: "",
    data,
  };
}

export function errorResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
): ApiResponse<T | null> {
  return {
    result: statusCode,
    message,
    data: data || null,
  };
}
