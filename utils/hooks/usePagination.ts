import { useCallback, useEffect, useRef, useState } from 'react';

export interface Paging {
  limit?: number;
  pageToken?: string;
}

export interface PaginatedResponse<T> {
  nextData: T[];
  nextPageToken: string | null | undefined;
}

type LoadDataCallback<T> = (paging: Paging) => Promise<PaginatedResponse<T>>;

interface PaginatedData<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: (limit?: number) => Promise<void>;
}

function usePagination<T>(
  loadData: LoadDataCallback<T>,
  pageSize: number,
  delay?: boolean
): PaginatedData<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [delayed, setDelayed] = useState(delay);

  const savedPageToken = useRef<string | undefined>(undefined);

  const loadMoreData = useCallback(
    async (limit?: number) => {
      setLoading(true);

      const paging = {
        limit: limit || pageSize,
        pageToken: savedPageToken.current,
      };

      const { nextData, nextPageToken } = await loadData(paging).catch(
        (err) => {
          setLoading(false);
          throw err;
        }
      );

      if (nextData.length === 0) {
        savedPageToken.current = undefined;
        setHasMore(false);
        setLoading(false);
        return;
      }

      setData((curr) => [...curr, ...nextData]);

      if (nextPageToken) {
        savedPageToken.current = nextPageToken;
      } else {
        savedPageToken.current = undefined;
        setHasMore(false);
      }

      setLoading(false);
    },
    [loadData]
  );

  useEffect(() => {
    if (!delay) {
      setDelayed(false);
    }
  }, [delay]);

  useEffect(() => {
    if (delayed) {
      return;
    }

    setData([]);
    setHasMore(true);
    setLoading(false);
    loadMoreData().catch((e) => console.error(e));
  }, [delayed, loadMoreData]);

  const loadMore = useCallback(
    async (limit?: number) => {
      if (delayed || loading || !hasMore) {
        return;
      }

      return loadMoreData(limit);
    },
    [delayed, loading, hasMore, loadMoreData]
  );

  return {
    data,
    loading,
    hasMore,
    loadMore,
  };
}

export default usePagination;
