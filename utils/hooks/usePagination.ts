import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
  initialLoadDone: boolean;
  loadMore: (limit?: number) => Promise<void>;
}

function usePagination<T>(
  loadData: LoadDataCallback<T>,
  pageSize: number,
  delay?: boolean
): PaginatedData<T> {
  const lifeCycleIdRef = useRef<string | undefined>();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const [delayed, setDelayed] = useState<boolean>(!!delay);

  const savedPageToken = useRef<string | undefined>(undefined);

  const loadMoreData = useCallback(
    async (lifeCycleIdAtStart: string, limit?: number, initial?: boolean) => {
      setLoading(true);

      const paging = {
        limit: limit || pageSize,
        pageToken: savedPageToken.current,
      };

      const tokenAtStart = savedPageToken.current;
      const { nextData, nextPageToken } = await loadData(paging).catch(
        (err) => {
          setLoading(false);
          throw err;
        }
      );

      // Drop if lifecycle id changed
      if (lifeCycleIdRef.current !== lifeCycleIdAtStart) {
        return;
      }

      // Drop if data for the token was already loaded
      if (tokenAtStart && tokenAtStart !== savedPageToken.current) {
        return;
      }

      if (initial) {
        setData(nextData);
      } else {
        setData((curr) => [...curr, ...nextData]);
      }

      if (nextData.length === 0 || !nextPageToken) {
        savedPageToken.current = undefined;
        setHasMore(false);
      } else {
        savedPageToken.current = nextPageToken;
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

    // Function for loading data change, clean and set new cycle id
    const newLifeCycle = uuidv4();
    lifeCycleIdRef.current = newLifeCycle;
    setInitialLoadDone(false);
    setHasMore(true);
    setLoading(false);

    loadMoreData(newLifeCycle, undefined, true)
      .then(() => {
        setInitialLoadDone(true);
      })
      .catch((e) => console.error(e));
  }, [delayed, loadMoreData]);

  const loadMore = useCallback(
    async (limit?: number) => {
      if (
        delayed ||
        loading ||
        data.length === 0 ||
        !hasMore ||
        !initialLoadDone ||
        !lifeCycleIdRef.current
      ) {
        return;
      }

      return loadMoreData(lifeCycleIdRef.current, limit);
    },
    [delayed, loading, data, hasMore, initialLoadDone, loadMoreData]
  );

  return {
    data,
    loading,
    hasMore,
    initialLoadDone,
    loadMore,
  };
}

export default usePagination;
