import {
  PaginationParams,
  PaginatedResponse,
  createEmptyPaginatedResponse,
} from './pagination.model';

describe('PaginationParams', () => {
  it('should create pagination params with page and pageSize', () => {
    const params: PaginationParams = { page: 1, pageSize: 10 };
    expect(params.page).toBe(1);
    expect(params.pageSize).toBe(10);
  });

  it('should support different page sizes', () => {
    const params: PaginationParams = { page: 3, pageSize: 25 };
    expect(params.page).toBe(3);
    expect(params.pageSize).toBe(25);
  });
});

describe('PaginatedResponse', () => {
  it('should create a paginated response with data', () => {
    const response: PaginatedResponse<string> = {
      data: ['a', 'b', 'c'],
      page: 1,
      pageSize: 3,
      total: 10,
      totalPages: 4,
    };
    expect(response.data).toEqual(['a', 'b', 'c']);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(3);
    expect(response.total).toBe(10);
    expect(response.totalPages).toBe(4);
  });

  it('should work with typed objects', () => {
    const response: PaginatedResponse<{ id: number }> = {
      data: [{ id: 1 }, { id: 2 }],
      page: 2,
      pageSize: 2,
      total: 4,
      totalPages: 2,
    };
    expect(response.data.length).toBe(2);
    expect(response.data[0].id).toBe(1);
  });
});

describe('createEmptyPaginatedResponse', () => {
  it('should return an empty paginated response', () => {
    const response = createEmptyPaginatedResponse<string>();
    expect(response.data).toEqual([]);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
    expect(response.total).toBe(0);
    expect(response.totalPages).toBe(0);
  });

  it('should work with any generic type', () => {
    const response = createEmptyPaginatedResponse<number>();
    expect(response.data.length).toBe(0);
  });
});
