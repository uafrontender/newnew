import moment from 'moment';
import { newnewapi } from 'newnew-api';

// export interface IUser {
//   chatUser: newnewapi.IUser;
//   // userName: string;
//   // userAlias: string;
//   justSubscribed?: boolean;
//   blockedUser?: boolean;
//   isAnnouncement?: boolean;
//   subscriptionExpired?: boolean;
//   messagingDisabled?: boolean;
//   accountDeleted?: boolean;
//   // avatar: string;
// }

export interface IMessage {
  id: string;
  message: string;
  mine: boolean;
  date: moment.Moment;
}

export interface IChatData {
  chatUser: newnewapi.IUser | null;
  justSubscribed?: boolean;
  blockedUser?: boolean;
  isAnnouncement?: boolean;
  subscriptionExpired?: boolean;
  messagingDisabled?: boolean;
  accountDeleted?: boolean;

  showChatList: { (): void } | null;
}
