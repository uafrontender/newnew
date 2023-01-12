import { useQuery, UseQueryOptions } from 'react-query';
import { newnewapi } from 'newnew-api';

import { fetchPostByUUID } from '../../api/endpoints/post';

interface IUsePost {
  loggedInUser: boolean;
  postUuid: string;
}

const usePost = (
  params: IUsePost,
  options?: Omit<UseQueryOptions<newnewapi.IPost, any>, 'queryKey' | 'queryFn'>
) => {
  const query = useQuery(
    [
      params.loggedInUser ? 'private' : 'public',
      'fetchPostByUUID',
      params.postUuid,
    ],
    async () => {
      const getPostPayload = new newnewapi.GetPostRequest({
        postUuid: params.postUuid,
      });

      const res = await fetchPostByUUID(getPostPayload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Post not found');

      return res.data;
    },
    {
      onError: (error) => {
        console.error(error);
      },
      ...options,
    } as Omit<UseQueryOptions<newnewapi.IPost, any>, 'queryKey' | 'queryFn'>
  );

  return query;
};

export default usePost;
