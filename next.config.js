/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  reactStrictMode: true,
  assetPrefix: process.env.NEXT_JS_ASSET_URL,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['raw-loader'],
    });

    return config;
  },
};
