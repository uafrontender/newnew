import React, { createContext, useMemo, useState } from 'react';

export const CommentFromUrlContext = createContext<{
  commentIdFromUrl?: string | null | undefined;
  handleResetCommentIdFromUrl?: () => void;
  handleSetCommentIdFromUrl?: (newValue: string) => void;
}>({
  commentIdFromUrl: '',
  handleResetCommentIdFromUrl: () => {},
  handleSetCommentIdFromUrl: () => {},
});

const CommentFromUrlContextProvider: React.FC = ({ children }) => {
  const [commentId, setCommentId] = useState('');

  const contextValue = useMemo(
    () => ({
      commentIdFromUrl: commentId,
      handleResetCommentIdFromUrl: () => setCommentId(''),
      handleSetCommentIdFromUrl: (newValue: string) => setCommentId(newValue),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commentId]
  );

  return <CommentFromUrlContext.Provider value={contextValue}>{children}</CommentFromUrlContext.Provider>;
};

export default CommentFromUrlContextProvider;
