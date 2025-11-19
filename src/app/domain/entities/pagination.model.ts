/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Creates an empty paginated response
 */
export function createEmptyPaginatedResponse<T>(): PaginatedResponse<T> {
  return {
    data: [],
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };
}
