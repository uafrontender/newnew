/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useMemo } from 'react';

export const PostModalContext = createContext<{
  postOverlayOpen: boolean;
  isConfirmToClosePost: boolean;
  handleSetPostOverlayOpen: (newState: boolean) => void;
  handleSetIsConfirmToClosePost: (newState: boolean) => void;
}>({
  postOverlayOpen: false,
  isConfirmToClosePost: false,
  handleSetPostOverlayOpen: (newState: boolean) => {},
  handleSetIsConfirmToClosePost: (newState: boolean) => {},
});

interface IPostModalContextProvider {
  children: React.ReactNode;
}

const PostModalContextProvider: React.FC<IPostModalContextProvider> = ({
  children,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isConfirmToClosePost, setIsConfirmToClosePost] = useState(false);

  const contextValue = useMemo(
    () => ({
      postOverlayOpen: modalOpen,
      isConfirmToClosePost,
      handleSetPostOverlayOpen: (newState: boolean) => setModalOpen(newState),
      handleSetIsConfirmToClosePost: (newState: boolean) =>
        setIsConfirmToClosePost(newState),
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [isConfirmToClosePost, modalOpen]
  );

  return (
    <PostModalContext.Provider value={contextValue}>
      {children}
    </PostModalContext.Provider>
  );
};

export default PostModalContextProvider;

export function usePostModalState() {
  const context = useContext(PostModalContext);
  if (!context)
    throw new Error(
      'usePostModalState must be used inside a `PostModalContextProvider`'
    );
  return context;
}
