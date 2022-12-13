/** @type {import('next-sitemap').IConfig} */

const disallow = [
  '/api/*',
  '/auth',
  '/auth/*',
  '/creation',
  '/creation/*',
  '/creator',
  '/creator/*',
  '/direct-messages',
  '/direct-messages/*',
  '/*/forced_redirect_to_home',
  '/profile',
  '/profile/*',
  '/change-email',
  '/creator-onboarding',
  '/creator-onboarding-about',
  '/creator-onboarding-stripe',
  '/creator-onboarding-subrate',
  '/forced_redirect_to_home',
  '/notifications',
  '/search',
  '/sign-up-payment',
  '/subscription-success',
  '/test',
  '/unsubscribe',
  '/verify-email',
  '/verify-new-email',
  '/404',
];

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: disallow,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: disallow,
      },
      { userAgent: '*', allow: '/' },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
      // `${process.env.NEXT_PUBLIC_APP_URL}/server-sitemap.xml`,
    ],
  },
};
