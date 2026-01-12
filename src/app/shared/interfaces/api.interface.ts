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
  totalCount: number;
  pagination: {
    pageSize: number;
    currentPage: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
