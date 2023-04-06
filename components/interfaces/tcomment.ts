import { newnewapi } from 'newnew-api';

export type TCommentWithReplies = newnewapi.ChatMessage & {
  replies?: newnewapi.ChatMessage[];
  isOpen?: boolean;
  index?: number;
};
