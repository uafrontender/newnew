import { newnewapi } from 'newnew-api';

export interface IChatData {
  chatRoom: newnewapi.IChatRoom | null;
  isNewMessage?: boolean;
  showChatList: { (): void } | null;
  updateLastMessage?: { (data: any): any } | null;
}
