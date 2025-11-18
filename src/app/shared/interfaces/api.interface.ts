export interface IBaseApiResponse<T> {
  body: T,
  success: boolean;
  statusCode: number;
  message: string;
  errors: string | null;
  timestamp: string;
}

export interface IApiPaginatedResponse<T> extends IBaseApiResponse<T> {
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

export interface IDashboardResponse<T> extends IApiPaginatedResponse<T> {
  counts: {
    totalOpportunities: number;
    activeOpportunities: number;
    inactiveOpportunities: number;
    draftOpportunities: number;
  };
}
