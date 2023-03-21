// import { newnewapi } from 'newnew-api';
import { getServerSideSitemap } from 'next-sitemap';
// import { searchPosts } from '../../api/endpoints/search';

export const getServerSideProps = async (ctx) => {
  // Return nothing, if staging
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
    return getServerSideSitemap(ctx, []);
  }

  // TODO: return see more?
  /* const SEE_MORE_CATEGORIES = ['ac', 'mc'];

  const seeMoreSitemaps = SEE_MORE_CATEGORIES.map((category) => ({
    loc: `${process.env.NEXT_PUBLIC_APP_URL}/see-more?category=${category}`,
    lastmod: new Date().toISOString(),
  })); */

  const postIds = [];
  // let postIds = [];

  // TODO: Load ALL posts (or all shortPostIds)
  /* const payload = new newnewapi.SearchPostsRequest({
    query: '',
  });

  const postsResponse = await searchPosts(payload);

  if (postsResponse.data && !postsResponse.error) {
    postIds = postsResponse?.data?.posts
      .map((post) => {
        if (post.auction) {
          return post.auction.postShortId;
        }
        if (post.crowdfunding) {
          return post.crowdfunding.postShortId;
        }
        if (post.multipleChoice) {
          return post.multipleChoice.postShortId;
        }
        return '';
      })
      .filter((postId) => postId !== '');
  } */

  const postUrlsEn = postIds.map((postId) => ({
    loc: `${process.env.NEXT_PUBLIC_APP_URL}/p/${postId}`,
    lastmod: new Date().toISOString(),
  }));

  const postUrlsEs = postIds.map((postId) => ({
    loc: `${process.env.NEXT_PUBLIC_APP_URL}/es/p/${postId}`,
    lastmod: new Date().toISOString(),
  }));

  const postUrlsZh = postIds.map((postId) => ({
    loc: `${process.env.NEXT_PUBLIC_APP_URL}/zh/p/${postId}`,
    lastmod: new Date().toISOString(),
  }));

  // TODO: add creator profiles?
  const fields = [
    /* ...seeMoreSitemaps */
    ...postUrlsEn,
    ...postUrlsEs,
    ...postUrlsZh,
  ];

  return getServerSideSitemap(ctx, fields);
};

export default function Site() {}
