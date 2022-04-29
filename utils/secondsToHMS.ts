// Light-weight function for seconds -> string conversion
export type HMSformat = 'h:m:s' | 'm:s' | 's';

const secondsToString = (sec: number, format?: HMSformat): string => {
  let hours: number | string = Math.floor(sec / 3600);
  let minutes: number | string = Math.floor((sec - hours * 3600) / 60);
  let seconds: number | string = sec - hours * 3600 - minutes * 60;

  if (hours < 10) hours = `0${hours}`;
  if (minutes < 10) minutes = `0${minutes}`;
  if (seconds < 10) seconds = `0${seconds}`;

  switch (format) {
    case 'h:m:s':
      return `${hours}:${minutes}:${seconds}`;
    case 'm:s':
      return `${minutes}:${seconds}`;
    default:
      return `${seconds}`;
  }
};

export default secondsToString;
