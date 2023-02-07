module.exports = {
  DEFAULT_LANGUAGE: 'en-US',
  // SUPPORTED_LANGUAGES: ['en-US', 'es-MX', 'fr'],
  SUPPORTED_LANGUAGES:
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? ['en-US', 'es', 'zh']
      : ['en-US', 'es', 'zh'],
  DEFAULT_CURRENCY: 'usd',
  SUPPORTED_CURRENCIES: ['usd', 'eur'],
  SUPPORTED_AUTH_PROVIDERS: ['google', 'apple', 'fb', 'twitter'],
  // MAX_VIDEO_SIZE: 104857600, // 100 mb
  MAX_VIDEO_SIZE: 10000000000, // 10 gb
  MIN_VIDEO_DURATION: 10, // 10 sec
  MAX_VIDEO_DURATION: 600, // 10 minutes
  CREATION_TITLE_MIN: 5,
  CREATION_TITLE_MAX: 80,
  CREATION_OPTION_MIN: 1,
  CREATION_OPTION_MAX: 80,
  HOURS: [
    {
      name: '01',
      value: '01',
    },
    {
      name: '02',
      value: '02',
    },
    {
      name: '03',
      value: '03',
    },
    {
      name: '04',
      value: '04',
    },
    {
      name: '05',
      value: '05',
    },
    {
      name: '06',
      value: '06',
    },
    {
      name: '07',
      value: '07',
    },
    {
      name: '08',
      value: '08',
    },
    {
      name: '09',
      value: '09',
    },
    {
      name: '10',
      value: '10',
    },
    {
      name: '11',
      value: '11',
    },
    {
      name: '12',
      value: '12',
    },
  ],
  MINUTES: [
    {
      name: '00',
      value: '00',
    },
    {
      name: '01',
      value: '01',
    },
    {
      name: '02',
      value: '02',
    },
    {
      name: '03',
      value: '03',
    },
    {
      name: '04',
      value: '04',
    },
    {
      name: '05',
      value: '05',
    },
    {
      name: '06',
      value: '06',
    },
    {
      name: '07',
      value: '07',
    },
    {
      name: '08',
      value: '08',
    },
    {
      name: '09',
      value: '09',
    },
    {
      name: '10',
      value: '10',
    },
    {
      name: '11',
      value: '11',
    },
    {
      name: '12',
      value: '12',
    },
    {
      name: '13',
      value: '13',
    },
    {
      name: '14',
      value: '14',
    },
    {
      name: '15',
      value: '15',
    },
    {
      name: '16',
      value: '16',
    },
    {
      name: '17',
      value: '17',
    },
    {
      name: '18',
      value: '18',
    },
    {
      name: '19',
      value: '19',
    },
    {
      name: '20',
      value: '20',
    },
    {
      name: '21',
      value: '21',
    },
    {
      name: '22',
      value: '22',
    },
    {
      name: '23',
      value: '23',
    },
    {
      name: '24',
      value: '24',
    },
    {
      name: '25',
      value: '25',
    },
    {
      name: '26',
      value: '26',
    },
    {
      name: '27',
      value: '27',
    },
    {
      name: '28',
      value: '28',
    },
    {
      name: '29',
      value: '29',
    },
    {
      name: '30',
      value: '30',
    },
    {
      name: '31',
      value: '31',
    },
    {
      name: '32',
      value: '32',
    },
    {
      name: '33',
      value: '33',
    },
    {
      name: '34',
      value: '34',
    },
    {
      name: '35',
      value: '35',
    },
    {
      name: '36',
      value: '36',
    },
    {
      name: '37',
      value: '37',
    },
    {
      name: '38',
      value: '38',
    },
    {
      name: '39',
      value: '39',
    },
    {
      name: '40',
      value: '40',
    },
    {
      name: '41',
      value: '41',
    },
    {
      name: '42',
      value: '42',
    },
    {
      name: '43',
      value: '43',
    },
    {
      name: '44',
      value: '44',
    },
    {
      name: '45',
      value: '45',
    },
    {
      name: '46',
      value: '46',
    },
    {
      name: '47',
      value: '47',
    },
    {
      name: '48',
      value: '48',
    },
    {
      name: '49',
      value: '49',
    },
    {
      name: '50',
      value: '50',
    },
    {
      name: '51',
      value: '51',
    },
    {
      name: '52',
      value: '52',
    },
    {
      name: '53',
      value: '53',
    },
    {
      name: '54',
      value: '54',
    },
    {
      name: '55',
      value: '55',
    },
    {
      name: '56',
      value: '56',
    },
    {
      name: '57',
      value: '57',
    },
    {
      name: '58',
      value: '58',
    },
    {
      name: '59',
      value: '59',
    },
  ],
  FORMAT: [
    {
      name: 'AM',
      value: 'am',
    },
    {
      name: 'PM',
      value: 'pm',
    },
  ],
  DAYS: [
    {
      value: 'sunday',
    },
    {
      value: 'monday',
    },
    {
      value: 'tuesday',
    },
    {
      value: 'wednesday',
    },
    {
      value: 'thursday',
    },
    {
      value: 'friday',
    },
    {
      value: 'saturday',
    },
  ],
};
