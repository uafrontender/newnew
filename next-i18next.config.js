const path = require('path');

const CONSTANTS = require('./constants/general');

module.exports = {
  i18n: {
    locales: CONSTANTS.SUPPORTED_LANGUAGES,
    localePath: path.resolve('./public/locales'),
    defaultLocale: CONSTANTS.DEFAULT_LANGUAGE,
  },
  reloadOnPrerender: process.env.NEXT_PUBLIC_ENVIRONMENT === 'local',
};
