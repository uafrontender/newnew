import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { AnimatePresence, motion } from 'framer-motion';

import isBrowser from '../../../../../utils/isBrowser';
import useOnClickEsc from '../../../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';

import Text from '../../../../atoms/Text';
import { useGetAppConstants } from '../../../../../contexts/appConstantsContext';
import { Mixpanel } from '../../../../../utils/mixpanel';

interface IMcOptionCardSelectVotesMenu {
  isVisible: boolean;
  isSupportedByMe: boolean;
  availableVotes: number[];
  top?: number;
  handleClose: () => void;
  handleOpenCustomAmountModal: () => void;
  handleSetAmountAndOpenModal: (votesAmount: string) => void;
}

const McOptionCardSelectVotesMenu: React.FunctionComponent<
  IMcOptionCardSelectVotesMenu
> = ({
  top,
  isVisible,
  isSupportedByMe,
  availableVotes,
  handleClose,
  handleOpenCustomAmountModal,
  handleSetAmountAndOpenModal,
}) => {
  const { t } = useTranslation('modal-Post');
  const containerRef = useRef<HTMLDivElement>();

  const { appConstants } = useGetAppConstants();

  const [bottom, setBottom] = useState<number | undefined>(undefined);

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  useEffect(() => {
    if (isBrowser()) {
      const container = document.getElementById('post-modal-container');
      if (container)
        if (isVisible) {
          container.style.overflowY = 'hidden';
        } else {
          container.style.overflowY = '';
        }
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const rect = containerRef?.current?.getBoundingClientRect();

      if (rect) {
        const isInViewPort =
          rect.bottom <=
          (window.innerHeight || document.documentElement?.clientHeight);

        if (!isInViewPort) {
          setBottom(24);
        }
      }
    } else {
      setBottom(undefined);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  if (isBrowser()) {
    return ReactDOM.createPortal(
      <StyledModalOverlay>
        <AnimatePresence>
          <SContainer
            ref={(el) => {
              containerRef.current = el!!;
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              ...(top && !bottom
                ? {
                    top: `${top}px`,
                  }
                : {}),
              ...(bottom
                ? {
                    bottom: `${bottom}px`,
                  }
                : {}),
            }}
          >
            <STitleText variant={3}>
              {!isSupportedByMe
                ? t('mcPost.optionsTab.optionCard.selectVotesMenu.title')
                : t(
                    'mcPost.optionsTab.optionCard.selectVotesMenu.titleMoreVotes'
                  )}
            </STitleText>
            {availableVotes.map((amount, id) => (
              <SButton
                id={`vote-option-${id}`}
                key={amount}
                onClickCapture={() => {
                  Mixpanel.track('Selected Votes Amount', {
                    _stage: 'Post',
                    _component: 'McOptionCardSelectVotesMenu',
                  });
                }}
                onClick={() => handleSetAmountAndOpenModal(amount.toString())}
              >
                <Text variant={3}>
                  <SBoldSpan>
                    {amount}{' '}
                    {amount === 1
                      ? t('mcPost.optionsTab.optionCard.selectVotesMenu.vote')
                      : t('mcPost.optionsTab.optionCard.selectVotesMenu.votes')}
                  </SBoldSpan>{' '}
                  <SOpaqueSpan>
                    {`($${
                      amount * Math.round(appConstants.mcVotePrice / 100)
                    })`}
                  </SOpaqueSpan>
                </Text>
              </SButton>
            ))}
            <SButton
              onClickCapture={() => {
                Mixpanel.track('Open Custom Votes Amount', {
                  _stage: 'Post',
                  _component: 'McOptionCardSelectVotesMenu',
                });
              }}
              onClick={() => handleOpenCustomAmountModal()}
            >
              <Text variant={3}>
                {t('mcPost.optionsTab.optionCard.selectVotesMenu.custom')}
              </Text>
            </SButton>
          </SContainer>
        </AnimatePresence>
      </StyledModalOverlay>,
      document.getElementById('modal-root') as HTMLElement
    );
  }

  return null;
};

export default McOptionCardSelectVotesMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  z-index: 10;
  right: 86px;
  width: 174px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  ${({ theme }) => theme.media.laptopL} {
    right: initial;
    left: calc(50% + 512px);
  }
`;

const STitleText = styled(Text)`
  text-align: center;
  width: 100%;
`;

const SButton = styled.button`
  background: none;
  border: transparent;

  cursor: pointer;

  background: ${({ theme }) => theme.colorsThemed.background.tertiary};

  width: 100%;
  border-radius: 8px;
  padding: 8px;

  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  &:focus,
  &:hover,
  &:active {
    outline: none;

    background: #ffffff;
    div {
      color: ${({ theme }) => theme.colors.dark};
    }
  }
`;

const SBoldSpan = styled.span``;

const SOpaqueSpan = styled.span`
  opacity: 0.8;
`;

const StyledModalOverlay = styled(motion.div)`
  left: 0;
  width: 100vw;
  height: 100vh;
  bottom: 0;
  z-index: 10;
  overflow: hidden;
  position: fixed;

  background-color: transparent;
`;
