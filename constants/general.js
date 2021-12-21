module.exports = {
  DEFAULT_LANGUAGE: 'en-US',
  SUPPORTED_LANGUAGES: ['en-US', 'es-MX', 'fr'],
  DEFAULT_CURRENCY: 'usd',
  SUPPORTED_CURRENCIES: ['usd', 'eur'],
  SUPPORTED_AUTH_PROVIDERS: [
    'google',
    'apple',
    'fb',
    'twitter',
  ],
  MAX_VIDEO_SIZE: 104857600, // 100 mb
  MIN_VIDEO_DURATION: 10, // 10 sec
  MAX_VIDEO_DURATION: 300, // 5 minutes
  CREATION_TITLE_MIN: 5,
  CREATION_TITLE_MAX: 70,
  CREATION_OPTION_MIN: 1,
  CREATION_OPTION_MAX: 40,
};
