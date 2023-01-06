import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import Modal from '../../../../organisms/Modal';
import Headline from '../../../../atoms/Headline';
import InlineSvg from '../../../../atoms/InlineSVG';

import CancelIcon from '../../../../../public/images/svg/icons/outlined/Close.svg';
import { Mixpanel } from '../../../../../utils/mixpanel';

interface IMcOptionCardSelectVotesModal {
  isVisible: boolean;
  isSupportedByMe: boolean;
  availableVotes: newnewapi.McVoteOffer[];
  children: React.ReactNode;
  handleClose: () => void;
  handleSetVoteOfferAndOpenModal: (votesAmount: newnewapi.McVoteOffer) => void;
  handleOpenBundleVotesModal?: () => void;
  handleOpenCustomAmountModal: () => void;
}

const McOptionCardSelectVotesModal: React.FunctionComponent<
  IMcOptionCardSelectVotesModal
> = ({
  isVisible,
  isSupportedByMe,
  availableVotes,
  children,
  handleClose,
  handleSetVoteOfferAndOpenModal,
  handleOpenBundleVotesModal,
  handleOpenCustomAmountModal,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');

  return (
    <Modal show={isVisible} overlaydim additionalz={10} onClose={handleClose}>
      <SContainer>
        <STitleContainer>
          <STitleText variant={6}>
            {!isSupportedByMe
              ? t('mcPost.optionsTab.optionCard.selectVotesMenu.title')
              : t(
                  'mcPost.optionsTab.optionCard.selectVotesMenu.titleMoreVotes'
                )}
          </STitleText>
          <SCancelButton
            view='transparent'
            iconOnly
            onClick={() => handleClose()}
          >
            <InlineSvg
              svg={CancelIcon}
              fill={theme.colorsThemed.text.primary}
              width='24px'
              height='24px'
            />
          </SCancelButton>
        </STitleContainer>
        {children}
        <SButtonsContainer>
          {availableVotes.map((voteOffer) => (
            <SButton
              key={voteOffer.amountOfVotes}
              onClick={() => handleSetVoteOfferAndOpenModal(voteOffer)}
            >
              <Text variant={3}>
                <SBoldSpan>
                  {voteOffer.amountOfVotes}{' '}
                  {voteOffer.amountOfVotes === 1
                    ? t('mcPost.optionsTab.optionCard.selectVotesMenu.vote')
                    : t('mcPost.optionsTab.optionCard.selectVotesMenu.votes')}
                </SBoldSpan>{' '}
                <SOpaqueSpan>
                  {`($${(voteOffer.price?.usdCents || 0) / 100})`}
                </SOpaqueSpan>
              </Text>
            </SButton>
          ))}
          <SButton onClick={() => handleOpenCustomAmountModal()}>
            <Text variant={3}>
              {t('mcPost.optionsTab.optionCard.selectVotesMenu.custom')}
            </Text>
          </SButton>
        </SButtonsContainer>
        {handleOpenBundleVotesModal && (
          <SUseVotesContainer>
            <SUseVotesButton
              onClickCapture={() => {
                Mixpanel.track('Open Bundle Votes', {
                  _stage: 'Post',
                  _component: 'McOptionCardSelectVotesMenu',
                });
              }}
              onClick={() => handleOpenBundleVotesModal()}
            >
              {t('mcPost.optionsTab.optionCard.selectVotesMenu.useVotes')}
            </SUseVotesButton>
          </SUseVotesContainer>
        )}
      </SContainer>
    </Modal>
  );
};

export default McOptionCardSelectVotesModal;

const SContainer = styled(motion.div)`
  position: absolute;
  bottom: 0;
  width: 100%;

  padding: 16px;
  padding-bottom: 32px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
`;

const STitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 24px;
`;

const SCancelButton = styled(Button)`
  background: ${({ theme }) => theme.colorsThemed.background.quaternary};
`;

const STitleText = styled(Headline)`
  text-align: left;
`;

const SButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-row-gap: 8px;
  grid-column-gap: 16px;

  & > button:last-of-type {
    grid-column: 1 / -1;
  }
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

const SUseVotesContainer = styled.div`
  width: 100%;
  border-top: 1px solid;
  border-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  margin-top: 12px;
`;

const SUseVotesButton = styled.button`
  background: none;
  border: transparent;

  cursor: pointer;

  color: ${({ theme }) => theme.colors.black};
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};

  width: 100%;
  border-radius: 16px;
  padding: 12px;
  margin-top: 12px;

  font-weight: 700;
  font-size: 16px;
  line-height: 24px;

  &:focus,
  &:hover,
  &:active {
    outline: none;
  }
`;
