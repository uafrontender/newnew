export type DHM = {
  days: string;
  hours: string;
  minutes: string;
};

const secondsToDHM = (sec: number, mode: 'noTrim' | 'trim' = 'trim'): DHM => {
  let days: number | string = Math.floor(sec / (3600 * 24));
  let hours: number | string = Math.floor((sec - days * 3600 * 24) / 3600);
  let minutes: number | string = Math.floor(
    (sec - hours * 3600 - days * 3600 * 24) / 60
  );

  if (days < 10 && days >= 1) {
    days = mode === 'noTrim' ? days : `0${days}`;
  }

  if (hours < 10 && hours >= 1) {
    hours = mode === 'noTrim' ? hours : `0${hours}`;
  }

  if (minutes < 10 && minutes >= 1) {
    minutes = mode === 'noTrim' ? minutes : `0${minutes}`;
  }

  if (typeof days === 'number' && days < 1) {
    days = mode === 'noTrim' ? '0' : '00';
  }

  if (typeof hours === 'number' && hours < 1) {
    hours = mode === 'noTrim' ? '0' : '00';
  }

  if (typeof minutes === 'number' && minutes < 1) {
    minutes = mode === 'noTrim' ? '0' : '00';
  }

  days = days.toString();
  hours = hours.toString();
  minutes = minutes.toString();

  return {
    days,
    hours,
    minutes,
  };
};

export default secondsToDHM;
