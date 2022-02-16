import moment from 'moment';

export interface IUser {
  uuid?: string;
  userName: string;
  userAlias: string;
  justSubscribed?: boolean;
  blockedUser?: boolean;
  isAnnouncement?: boolean;
  subscriptionExpired?: boolean;
  messagingDisabled?: boolean;
  accountDeleted?: boolean;
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
  isAnnouncement?: boolean;
  showChatList?: () => void;
}
