import { newnewapi } from 'newnew-api';
import { useInfiniteQuery } from 'react-query';

import { getMyPosts } from '../../api/endpoints/user';

interface IUseMyPosts {
  relation: newnewapi.GetRelatedToMePostsRequest.Relation;
  postsFilter: newnewapi.Post.Filter;
}

const useMyPosts = (params: IUseMyPosts) => {
  const query = useInfiniteQuery(
    ['private', 'getMyPosts', params.relation, params.postsFilter],
    async ({ pageParam }) => {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: params.relation,
        filter: params.postsFilter,
        paging: {
          pageToken: pageParam,
        },
        needTotalCount: true,
      });

      const postsResponse = await getMyPosts(payload);

      if (!postsResponse.data || postsResponse.error) {
        throw new Error('Request failed');
      }

      return {
        posts: postsResponse?.data?.posts || [],
        paging: postsResponse?.data?.paging,
      };
    },
    {
      getNextPageParam: (lastPage) => lastPage?.paging?.nextPageToken,
      onError: (error) => {
        console.error(error);
      },
    }
  );

  return query;
};

export default useMyPosts;
