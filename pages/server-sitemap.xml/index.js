import { getServerSideSitemap } from 'next-sitemap';

export const getServerSideProps = async (ctx) => {
  // Return nothing, if staging
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
    return getServerSideSitemap(ctx, []);
  }

  const BASE_URL_SITEMAP = `${process.env.NEXT_PUBLIC_BASE_URL.replace(
    '/v1',
    ''
  )}/sitemap`;

  // TODO: return see more?
  /* const SEE_MORE_CATEGORIES = ['ac', 'mc'];

  const seeMoreSitemaps = SEE_MORE_CATEGORIES.map((category) => ({
    loc: `${process.env.NEXT_PUBLIC_APP_URL}/see-more?category=${category}`,
    lastmod: new Date().toISOString(),
  })); */

  const postsResponse = await fetch(`${BASE_URL_SITEMAP}/posts`);
  const postIds = await postsResponse.json();

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

  const creatorsResponse = await fetch(`${BASE_URL_SITEMAP}/creators`);
  const creatorUsernames = await creatorsResponse.json();

  const creatorUrlsEn = creatorUsernames.map((username) => ({
    loc: `${process.env.NEXT_PUBLIC_APP_URL}/${username}`,
    lastmod: new Date().toISOString(),
  }));

  const creatorUrlsEs = creatorUsernames.map((username) => ({
    loc: `${process.env.NEXT_PUBLIC_APP_URL}/es/${username}`,
    lastmod: new Date().toISOString(),
  }));

  const creatorUrlsZh = creatorUsernames.map((username) => ({
    loc: `${process.env.NEXT_PUBLIC_APP_URL}/zh/${username}`,
    lastmod: new Date().toISOString(),
  }));

  const fields = [
    /* ...seeMoreSitemaps */
    ...postUrlsEn,
    ...postUrlsEs,
    ...postUrlsZh,
    ...creatorUrlsEn,
    ...creatorUrlsEs,
    ...creatorUrlsZh,
  ];

  return getServerSideSitemap(ctx, fields);
};

export default function Site() {}
