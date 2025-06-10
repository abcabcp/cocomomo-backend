export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "인증에 실패했습니다",
  FORBIDDEN: "권한이 없습니다",
  NOT_FOUND: "리소스를 찾을 수 없습니다",
  POST_NOT_FOUND: "게시글을 찾을 수 없습니다",
  COMMENT_NOT_FOUND: "댓글을 찾을 수 없습니다",
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다",
  POST_CREATE_FAILED: "게시글을 생성할 수 없습니다",
  POST_UPDATE_FAILED: "게시글을 수정할 수 없습니다",
  POST_DELETE_FAILED: "게시글을 삭제할 수 없습니다",
  COMMENT_CREATE_FAILED: "댓글을 생성할 수 없습니다",
  COMMENT_UPDATE_FAILED: "댓글을 수정할 수 없습니다",
  COMMENT_DELETE_FAILED: "댓글을 삭제할 수 없습니다",
  NO_PERMISSION: "수정/삭제 권한이 없습니다",
  IMAGE_UPLOAD_FAILED: "이미지 업로드에 실패했습니다",
  INVALID_IMAGE_FORMAT: "유효하지 않은 이미지 형식입니다",
};
