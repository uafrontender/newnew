export type DHM = {
  days: string;
  hours: string;
  minutes: string;
}

const secondsToDHM = (sec: number): DHM => {
  let days: number | string = Math.floor(sec / (3600 * 24));
  let hours: number | string = Math.floor((sec - (days * 3600 * 24)) / 3600);
  let minutes: number | string = Math.floor((sec - hours * 3600 - days * 3600 * 24) / 60);

  if (days < 10 && days >= 1) days = `0${days}`;
  if (hours < 10 && hours >= 1) hours = `0${hours}`;
  if (minutes < 10 && minutes >= 1) minutes = `0${minutes}`;

  if (days < 1) days = '00';
  if (hours < 1) hours = '00';
  if (minutes < 1) minutes = '00';

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
