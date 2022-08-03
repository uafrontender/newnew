/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
  useRef,
} from 'react';

import { useAppSelector } from '../redux-store/store';

export const PostModalContext = createContext<{
  postOverlayOpen: boolean;
  handleSetPostOverlayOpen: (newState: boolean) => void;
  isConfirmToClosePost: boolean;
  handleSetIsConfirmToClosePost: (newState: boolean) => void;
}>({
  postOverlayOpen: false,
  handleSetPostOverlayOpen: (newState: boolean) => {},
  isConfirmToClosePost: false,
  handleSetIsConfirmToClosePost: (newState: boolean) => {},
});

interface IPostModalContextProvider {
  children: React.ReactNode;
}

const PostModalContextProvider: React.FC<IPostModalContextProvider> = ({
  children,
}) => {
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [isConfirmToClosePost, setIsConfirmToClosePost] = useState(false);

  const scrollPosition = useRef(0);

  useEffect(() => {
    if (modalOpen) {
      scrollPosition.current = window ? window.scrollY : 0;

      document.body.style.cssText = `
        overflow: hidden;
      `;
    } else {
      document.body.style.cssText = '';
      document.documentElement.style.cssText = '';
      window?.scroll(0, scrollPosition.current);
    }
  }, [modalOpen]);

  const contextValue = useMemo(
    () => ({
      postOverlayOpen: modalOpen,
      handleSetPostOverlayOpen: (newState: boolean) => setModalOpen(newState),
      isConfirmToClosePost,
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
