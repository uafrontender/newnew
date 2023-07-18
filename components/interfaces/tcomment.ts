import { newnewapi } from 'newnew-api';

export type TCommentWithReplies = newnewapi.CommentMessage & {
  replies?: newnewapi.CommentMessage[];
  isOpen?: boolean;
  index?: number;
};
