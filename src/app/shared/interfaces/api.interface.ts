export interface IBaseApiResponse<T> {
  body: T,
  success: boolean;
  statusCode: number;
  message: string[];
  errors: string[] | null;
  timestamp: string;
}

export interface IApiPaginatedResponse<T> {
  data: T;
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}