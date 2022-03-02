import { newnewapi } from 'newnew-api';

export interface IChatData {
  chatRoom: newnewapi.IChatRoom | null;
  justSubscribed?: boolean;
  blockedUser?: boolean;
  isAnnouncement?: boolean;
  subscriptionExpired?: boolean;
  messagingDisabled?: boolean;
  accountDeleted?: boolean;

  showChatList: { (): void } | null;
}
