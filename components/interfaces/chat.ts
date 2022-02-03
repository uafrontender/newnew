import moment from 'moment';

export interface IUser {
  userName: string;
  userAlias: string;
  justSubscribed: boolean;
  blockedUser: boolean;
  avatar: string;
}

export interface IMessage {
  id: string;
  message: string;
  mine: boolean;
  date: moment.Moment;
}

export interface IChatData {
  userData: IUser | null;
  messages: IMessage[];
}
