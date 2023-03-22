const getDateFormatForTimeZone = (
  timeZone: string | null | undefined,
  isFnsStyle?: boolean
) => {
  if (!timeZone) {
    return isFnsStyle ? 'MM-dd-yy' : 'MM-DD-YY';
  }

  // USA
  if (
    [
      'Pacific/Honolulu',
      'America/Anchorage',
      'America/Juneau',
      'America/Metlakatla',
      'America/Nome',
      'America/Sitka',
      'America/Yakutat',
      'America/Los_Angeles',
      'America/Boise',
      'America/Denver',
      'America/Phoenix',
      'America/Chicago',
      'America/Indiana/Knox',
      'America/Indiana/Tell_City',
      'America/Menominee',
      'America/North_Dakota/Beulah',
      'America/North_Dakota/Center',
      'America/North_Dakota/New_Salem',
      'America/Detroit',
      'America/Indiana/Indianapolis',
      'America/Indiana/Marengo',
      'America/Indiana/Petersburg',
      'America/Indiana/Vevay',
      'America/Indiana/Vincennes',
      'America/Indiana/Winamac',
      'America/Kentucky/Louisville',
      'America/Kentucky/Monticello',
      'America/New_York',
      'America/Adak',
    ].includes(timeZone)
  ) {
    return isFnsStyle ? 'MM-dd-yy' : 'MM-DD-YY';
  }

  // China, Japan, South Korea, Taiwan
  if (
    [
      'Asia/Shanghai',
      'Asia/Macau',
      'Asia/Taipei',
      'Asia/Seoul',
      'Asia/Tokyo',
    ].includes(timeZone)
  ) {
    return isFnsStyle ? 'yyyy-MM-dd' : 'YYYY-MM-DD';
  }

  return isFnsStyle ? 'dd-MM-yy' : 'DD-MM-YY';
};

export default getDateFormatForTimeZone;
