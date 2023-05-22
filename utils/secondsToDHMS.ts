export type DHMS = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const secondsToDHMS = (sec: number, mode: 'noTrim' | 'trim' = 'trim'): DHMS => {
  let days: number | string = Math.floor(sec / (3600 * 24));
  let hours: number | string = Math.floor((sec - days * 3600 * 24) / 3600);
  let minutes: number | string = Math.floor(
    (sec - hours * 3600 - days * 3600 * 24) / 60
  );
  let seconds: number | string = Math.floor(
    sec - hours * 3600 - days * 3600 * 24 - minutes * 60
  );

  if (days < 10 && days >= 1) {
    days = mode === 'noTrim' ? `0${days}` : days;
  }
  if (hours < 10 && hours >= 1) {
    hours = mode === 'noTrim' ? `0${hours}` : hours;
  }
  if (minutes < 10 && minutes >= 1) {
    minutes = mode === 'noTrim' ? `0${minutes}` : minutes;
  }
  if (seconds < 10) {
    seconds = mode === 'noTrim' ? `0${seconds}` : seconds;
  }

  if (typeof days === 'number' && days < 1) {
    days = mode === 'noTrim' ? '00' : '0';
  }
  if (typeof hours === 'number' && hours < 1) {
    hours = mode === 'noTrim' ? '00' : '0';
  }
  if (typeof minutes === 'number' && minutes < 1) {
    minutes = mode === 'noTrim' ? '00' : '0';
  }

  days = days.toString();
  hours = hours.toString();
  minutes = minutes.toString();
  seconds = seconds.toString();

  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

export default secondsToDHMS;
