import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import InlineSvg from '../atoms/InlineSVG';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

import copyIcon from '../../public/images/svg/icons/outlined/Link.svg';
import { useAppSelector } from '../../redux-store/store';

interface IShareMenu {
  isVisible: boolean;
  absolute?: boolean;
  handleClose: () => void;
}

const ShareMenu: React.FC<IShareMenu> = ({
  isVisible,
  handleClose,
  absolute,
}) => {
  const { t } = useTranslation('common');
  const user = useAppSelector((state) => state.user);
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const handlerCopy = useCallback(() => {
    if (window) {
      const url = `${window.location.origin}/${user.userData?.username}`;

      copyPostUrlToClipboard(url)
        .then(() => {
          setIsCopiedUrl(true);
          setTimeout(() => {
            setIsCopiedUrl(false);
            handleClose();
          }, 1500);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <SContainer
          absolute={absolute ?? false}
          ref={(el) => {
            containerRef.current = el!!;
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SItemButtonWide onClick={handlerCopy}>
            <InlineSvg svg={copyIcon} width='24px' height='24px' />
            {isCopiedUrl ? t('myLink.copied') : t('myLink.copy')}
          </SItemButtonWide>
        </SContainer>
      )}
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

const SItemButtonWide = styled.div`
  width: 100%;
  height: 36px;
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 12px;
  background: ${(props) => props.theme.colorsThemed.social.copy.main};

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;

  color: #ffffff;
  cursor: pointer;
`;
