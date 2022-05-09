/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  assetPrefix: process.env.NEXT_JS_ASSET_URL,
  reactStrictMode: true,
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
      'd3hqmhx7uxxlrw.cloudfront.net',
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
};
