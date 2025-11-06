import { useState, useEffect, useCallback } from 'react';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface FetchResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UseAdvancedFetchOptions {
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean;
}

export interface UseAdvancedFetchReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  refresh: () => void;
  refetch: () => void;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  fetchPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useAdvancedFetch = <T = any>(
  url: string,
  options: UseAdvancedFetchOptions = {},
): UseAdvancedFetchReturn<T> => {
  const { initialPage = 1, initialLimit = 10, autoFetch = true } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [limit, setLimitState] = useState<number>(initialLimit);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchData = useCallback(
    async (page: number, pageLimit: number) => {
      setLoading(true);
      setError(null);

      try {
        const fetchUrl = `${url}?page=${page}&limit=${pageLimit}`;

        const response = await fetch(fetchUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: FetchResponse<T> = await response.json();

        setData(result.data);
        setPagination(result.pagination);
        setCurrentPage(result.pagination.currentPage);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setData([]);
        setPagination({
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  const refresh = useCallback(() => {
    fetchData(currentPage, limit);
  }, [fetchData, currentPage, limit]);

  const refetch = useCallback(() => {
    fetchData(currentPage, limit);
  }, [fetchData, currentPage, limit]);

  const fetchNextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      const nextPage = currentPage + 1;
      fetchData(nextPage, limit);
    }
  }, [fetchData, currentPage, limit, pagination.hasNextPage]);

  const fetchPreviousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      const prevPage = currentPage - 1;
      fetchData(prevPage, limit);
    }
  }, [fetchData, currentPage, limit, pagination.hasPreviousPage]);

  const fetchPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        fetchData(page, limit);
      }
    },
    [fetchData, limit, pagination.totalPages],
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      setLimitState(newLimit);
      fetchData(1, newLimit); 
    },
    [fetchData],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchData(currentPage, limit);
    }
  }, [autoFetch, fetchData, currentPage, limit]);

  return {
    data,
    loading,
    error,
    pagination,
    refresh,
    refetch, 
    fetchNextPage,
    fetchPreviousPage,
    fetchPage,
    setLimit,
  };
};
