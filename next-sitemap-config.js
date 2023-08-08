/** @type {import('next-sitemap').IConfig} */

const disallow = [
  '/api/*',
  '/auth',
  '/auth/*',
  '/bundles',
  '/change-email',
  '/edit-email',
  '/creation',
  '/creation/*',
  '*/creator',
  '*/creator/*',
  '/creator-onboarding',
  '/creator-onboarding-about',
  '/creator-onboarding-stripe',
  '/*/creator-onboarding-stripe',
  '/creator-onboarding-subrate',
  '/dashboard',
  '/get-paid',
  '/direct-messages',
  '/direct-messages/*',
  '/forced_redirect_to_home',
  '*/forced_redirect_to_home',
  '*/notifications',
  '/profile',
  '/*/profile',
  '/profile/*',
  '/*/profile/*',
  '/search',
  '/see-more',
  '/sign-up',
  '/sign-up-payment',
  '/verify-email',
  '/verify-new-email',
  '/*/verify-new-email',
  '/unsubscribe',
  '/404',
  '*/404',
];

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: disallow,
  additionalPaths: async (config) => {
    const result = [];

    // Following urls are missing from generated sitemap
    result.push(await config.transform(config, '/es'));
    result.push(await config.transform(config, '/es/how-it-works'));
    result.push(await config.transform(config, '/zh'));
    result.push(await config.transform(config, '/zh/how-it-works'));

    return result;
  },
  robotsTxtOptions: {
    policies:
      // If staging, disallow all
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
        ? [{ userAgent: '*', disallow: '/' }]
        : [
            {
              userAgent: '*',
              disallow: disallow,
            },
            { userAgent: '*', allow: '/' },
          ],
    additionalSitemaps:
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
        ? []
        : [`${process.env.NEXT_PUBLIC_APP_URL}/server-sitemap.xml`],
  },
};
