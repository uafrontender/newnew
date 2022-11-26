import { newnewapi } from 'newnew-api';

export interface IChatData {
  chatRoom: newnewapi.IChatRoom | null;
  blockedUser?: boolean;
  isAnnouncement?: boolean;
  subscriptionExpired?: boolean;
  messagingDisabled?: boolean;
  accountDeleted?: boolean;

  isNewMessage?: boolean;
  showChatList: { (): void } | null;
  updateLastMessage?: { (data: any): any } | null;
}
