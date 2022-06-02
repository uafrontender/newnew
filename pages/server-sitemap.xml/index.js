import { getServerSideSitemap } from 'next-sitemap';

export const getServerSideProps = async (ctx) => {
  const SEE_MORE_CATEGORIES = ['ac', 'mc', 'cf'];

  const seeMoreSitemaps = SEE_MORE_CATEGORIES.map((category) => ({
    loc: `${process.env.NEXT_PUBLIC_APP_URL}/see-more?category=${category}`,
    lastmod: new Date().toISOString(),
  }));

  const fields = [...seeMoreSitemaps];

  return getServerSideSitemap(ctx, fields);
};

export default function Site() {}
