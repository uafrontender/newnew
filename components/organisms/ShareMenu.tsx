import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import InlineSvg from '../atoms/InlineSVG';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

import copyIcon from '../../public/images/svg/icons/outlined/Link.svg';

interface IShareMenu {
  isVisible: boolean;
  noabsolute?: boolean;
  handleClose: () => void;
}

const ShareMenu: React.FC<IShareMenu> = ({
  isVisible,
  handleClose,
  noabsolute,
}) => {
  const { t } = useTranslation('common');
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
      const url = `${window.location}`;

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
  }, [handleClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <SContainer
          absolute={noabsolute}
          ref={(el) => {
            containerRef.current = el!!;
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SItemButtonWide onClick={handlerCopy}>
            <InlineSvg svg={copyIcon} width='24px' height='24px' />
            {isCopiedUrl ? t(`socials.copied`) : t(`socials.copy`)}
          </SItemButtonWide>
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default ShareMenu;

ShareMenu.defaultProps = {
  noabsolute: false,
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
