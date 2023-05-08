/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const { i18n } = require('./next-i18next.config');

const moduleExports = {
  i18n,
  assetPrefix: process.env.NEXT_JS_ASSET_URL,
  reactStrictMode: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['raw-loader'],
    });

    return config;
  },
  images: {
    domains: [
      'randomuser.me',
      'i.pravatar.cc',
      'd3hqmhx7uxxlrw.cloudfront.net',
      'd2ya8a6kszdsc6.cloudfront.net',
      'd2x9we5puoe468.cloudfront.net',
      'd2ttpqwdet9svd.cloudfront.net',
      'd1njz9x2j01y96.cloudfront.net',
    ],
  },
  async headers() {
    return [
      {
        source: '/fonts/:path',
        headers: [
          {
            key: 'Cache-control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/mp/lib.min.js',
        destination: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js',
      },
      {
        source: '/mp/lib.js',
        destination: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.js',
      },
      {
        source: '/mp/:slug',
        // use "api-eu.mixpanel.com" if you need to use EU servers
        destination: 'https://api.mixpanel.com/:slug',
      },
      {
        source: '/direct-messages',
        destination: '/direct-messages/empty',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/post/:path*',
        destination: '/p/:path*',
        permanent: true,
      },
    ];
  },
  experimental: {
    scrollRestoration: true,
  },
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  org: 'newnew-inc',
  project: 'newnew-web',

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
