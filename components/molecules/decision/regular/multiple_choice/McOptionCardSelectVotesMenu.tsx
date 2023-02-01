import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';

import isBrowser from '../../../../../utils/isBrowser';
import useOnClickEsc from '../../../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';

import Text from '../../../../atoms/Text';
import { Mixpanel } from '../../../../../utils/mixpanel';
import { useOverlayMode } from '../../../../../contexts/overlayModeContext';

interface IMcOptionCardSelectVotesMenu {
  isVisible: boolean;
  isSupportedByMe: boolean;
  availableVotes: newnewapi.McVoteOffer[];
  top?: number;
  handleClose: () => void;
  handleSetVoteOfferAndOpenModal: (voteOffer: newnewapi.McVoteOffer) => void;
  handleOpenBundleVotesModal?: () => void;
  handleOpenCustomAmountModal: () => void;
}

const McOptionCardSelectVotesMenu: React.FunctionComponent<
  IMcOptionCardSelectVotesMenu
> = ({
  top,
  isVisible,
  isSupportedByMe,
  availableVotes,
  handleClose,
  handleOpenBundleVotesModal,
  handleSetVoteOfferAndOpenModal,
  handleOpenCustomAmountModal,
}) => {
  const { t } = useTranslation('page-Post');
  const containerRef = useRef<HTMLDivElement>();

  const [bottom, setBottom] = useState<number | undefined>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();

  useEffect(() => {
    if (isVisible) {
      enableOverlayMode();
    }

    return () => {
      disableOverlayMode();
    };
  }, [isVisible, enableOverlayMode, disableOverlayMode]);

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
            {availableVotes.map((voteOffer, id) => (
              <SButton
                id={`vote-option-${id}`}
                key={voteOffer.amountOfVotes}
                onClickCapture={() => {
                  Mixpanel.track('Select Votes Amount', {
                    _stage: 'Post',
                    _component: 'McOptionCardSelectVotesMenu',
                  });
                }}
                onClick={() => handleSetVoteOfferAndOpenModal(voteOffer)}
              >
                <Text variant={3}>
                  <SBoldSpan>
                    {voteOffer.amountOfVotes}{' '}
                    {voteOffer.amountOfVotes === 1
                      ? t('mcPost.optionsTab.optionCard.selectVotesMenu.vote')
                      : t('mcPost.optionsTab.optionCard.selectVotesMenu.votes')}
                  </SBoldSpan>{' '}
                  <SOpaqueSpan id={`vote-option-${id}-price`}>{`($${
                    (voteOffer.price?.usdCents || 0) / 100
                  })`}</SOpaqueSpan>
                </Text>
              </SButton>
            ))}
            <SButton
              id='vote-option-custom'
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
            {handleOpenBundleVotesModal && (
              <SUseVotesContainer>
                <SUseVotesButton
                  id='vote-option-bundle'
                  onClickCapture={() => {
                    Mixpanel.track('Open Bundle Votes', {
                      _stage: 'Post',
                      _component: 'McOptionCardSelectVotesMenu',
                    });
                  }}
                  onClick={() => handleOpenBundleVotesModal()}
                >
                  <SUseVotesText variant={3}>
                    {t('mcPost.optionsTab.optionCard.selectVotesMenu.useVotes')}
                  </SUseVotesText>
                </SUseVotesButton>
              </SUseVotesContainer>
            )}
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

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

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

const SUseVotesContainer = styled.div`
  width: 100%;
  border-top: 1px solid;
  border-color: ${({ theme }) => theme.colorsThemed.background.quinary};
`;

const SUseVotesButton = styled.button`
  background: none;
  border: transparent;

  cursor: pointer;

  background: ${({ theme }) => theme.colorsThemed.accent.yellow};

  width: 100%;
  border-radius: 8px;
  padding: 8px;
  margin-top: 12px;

  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  &:focus,
  &:hover,
  &:active {
    outline: none;
  }
`;

const SUseVotesText = styled(Text)`
  color: ${({ theme }) => theme.colors.black};
`;
