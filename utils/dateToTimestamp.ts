import { google } from 'newnew-api';
import moment from 'moment';

function dateToTimestamp(
  date: string | Date | moment.Moment
): google.protobuf.ITimestamp {
  return new google.protobuf.Timestamp({
    seconds: moment(date).utc().unix(),
  });
}

export default dateToTimestamp;
