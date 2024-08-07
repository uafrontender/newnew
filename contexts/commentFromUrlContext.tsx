import React, { createContext, useMemo, useState } from 'react';

export const CommentFromUrlContext = createContext<{
  commentIdFromUrl?: string | null | undefined;
  handleResetCommentIdFromUrl?: () => void;
  handleSetCommentIdFromUrl?: (newValue: string) => void;
  newCommentContentFromUrl?: string | null | undefined;
  handleResetNewCommentContentFromUrl?: () => void;
  handleSetNewCommentContentFromUrl?: (newValue: string) => void;
}>({
  commentIdFromUrl: '',
  handleResetCommentIdFromUrl: () => {},
  handleSetCommentIdFromUrl: () => {},
  newCommentContentFromUrl: '',
  handleResetNewCommentContentFromUrl: () => {},
  handleSetNewCommentContentFromUrl: () => {},
});

interface ICommentFromUrlContextProvider {
  commentIdFromUrl?: string;
  commentContentFromUrl?: string;
  children: React.ReactNode;
}

const CommentFromUrlContextProvider: React.FC<
  ICommentFromUrlContextProvider
> = ({ commentIdFromUrl, commentContentFromUrl, children }) => {
  const [commentId, setCommentId] = useState(commentIdFromUrl || '');
  const [newCommentContent, setNewCommentContent] = useState(
    commentContentFromUrl || ''
  );

  const contextValue = useMemo(
    () => ({
      commentIdFromUrl: commentId,
      handleResetCommentIdFromUrl: () => setCommentId(''),
      handleSetCommentIdFromUrl: (newValue: string) => setCommentId(newValue),
      newCommentContentFromUrl: newCommentContent,
      handleResetNewCommentContentFromUrl: () => setNewCommentContent(''),
      handleSetNewCommentContentFromUrl: (newValue: string) =>
        setNewCommentContent(newValue),
    }),
    [commentId, newCommentContent]
  );

  return (
    <CommentFromUrlContext.Provider value={contextValue}>
      {children}
    </CommentFromUrlContext.Provider>
  );
};

export default CommentFromUrlContextProvider;
