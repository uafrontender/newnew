/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useMemo } from 'react';

export const PostModalContext = createContext<{
  postOverlayOpen: boolean;
  handleSetPostOverlayOpen: (newState: boolean) => void;
}>({
  postOverlayOpen: false,
  handleSetPostOverlayOpen: (newState: boolean) => {},
});

const PostModalContextProvider: React.FC = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const contextValue = useMemo(
    () => ({
      postOverlayOpen: modalOpen,
      handleSetPostOverlayOpen: (newState: boolean) => setModalOpen(newState),
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [modalOpen]
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
