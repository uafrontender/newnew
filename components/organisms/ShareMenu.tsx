import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import styled from 'styled-components';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

import { useAppSelector } from '../../redux-store/store';
import SharePanel from '../atoms/SharePanel';

interface IShareMenu {
  absolute?: boolean;
  handleClose: () => void;
}

const ShareMenu: React.FC<IShareMenu> = ({ handleClose, absolute }) => {
  const user = useAppSelector((state) => state.user);
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  return (
    <AnimatePresence>
      <SContainer
        absolute={absolute ?? false}
        ref={(el) => {
          containerRef.current = el!!;
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SSharePanel
          linkToShare={`${window.location.origin}/${user.userData?.username}`}
          onCopyLink={handleClose}
        />
      </SContainer>
    </AnimatePresence>
  );
};

export default ShareMenu;

ShareMenu.defaultProps = {
  absolute: false,
};

interface ISContainer {
  absolute: boolean | undefined;
}

const SContainer = styled(motion.div)<ISContainer>`
  position: ${(props) => (props.absolute ? 'absolute' : 'static')};
  top: 100%;
  z-index: 10;
  left: 0;
  top: 30px;
  width: 216px;
  box-shadow: 0px 0px 35px 10px rgba(0, 0, 0, 0.25);

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
`;
const SSharePanel = styled(SharePanel)`
  width: 100%;
`;
