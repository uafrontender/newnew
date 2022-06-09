/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../../redux-store/store';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Modal from '../../../organisms/Modal';
import Headline from '../../../atoms/Headline';
import VotesAmountInputModal from '../../../atoms/decision/VotesAmountInputModal';

// Icons
import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import assets from '../../../../constants/assets';

interface IMcConfirmVoteModal {
  isOpen: boolean;
  zIndex: number;
  minAmount: number;
  votePrice: number;
  postCreator: string;
  optionText: string;
  predefinedAmount: boolean;
  supportVotesAmount: string;
  onClose: () => void;
  handleSetSupportVotesAmount: (newAmount: string) => void;
  handleOpenPaymentModal: () => void;
}

const McConfirmVoteModal: React.FC<IMcConfirmVoteModal> = ({
  isOpen,
  zIndex,
  minAmount,
  votePrice,
  postCreator,
  optionText,
  predefinedAmount,
  supportVotesAmount,
  onClose,
  handleSetSupportVotesAmount,
  handleOpenPaymentModal,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  if (predefinedAmount) {
    return (
      <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
        <SWrapper>
          <SContentContainer
            onClick={(e: any) => {
              e.stopPropagation();
            }}
          >
            <SCloseButton iconOnly view='transparent' onClick={onClose}>
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCloseButton>
            <SImageContainer>
              <img src={assets.decision.votes} alt='votes' />
            </SImageContainer>
            <SHeadline variant={4}>
              {supportVotesAmount}{' '}
              {parseInt(supportVotesAmount) === 1
                ? t('McPost.OptionsTab.OptionCard.ConfirmVoteModal.vote')
                : t('McPost.OptionsTab.OptionCard.ConfirmVoteModal.votes')}
            </SHeadline>
            <SCreatorsText variant={2}>
              {parseInt(supportVotesAmount) === 1
                ? t(
                    'McPost.OptionsTab.OptionCard.ConfirmVoteModal.body_1_vote',
                    { creator: postCreator }
                  )
                : t(
                    'McPost.OptionsTab.OptionCard.ConfirmVoteModal.body_multiple_votes',
                    { creator: postCreator, amount: supportVotesAmount }
                  )}
            </SCreatorsText>
            <SCaption variant={3}>
              {t(
                'McPost.OptionsTab.OptionCard.ConfirmVoteModal.option_caption'
              )}
            </SCaption>
            <SOptionText variant={2}>{optionText}</SOptionText>
            <SVoteButton
              view='primary'
              onClick={() => handleOpenPaymentModal()}
            >
              {t('McPost.OptionsTab.OptionCard.ConfirmVoteModal.voteBtn')}
            </SVoteButton>
          </SContentContainer>
        </SWrapper>
      </Modal>
    );
  }

  return (
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e: any) => {
            e.stopPropagation();
          }}
        >
          <SCloseButton iconOnly view='transparent' onClick={onClose}>
            <InlineSvg
              svg={CancelIcon}
              fill={theme.colorsThemed.text.primary}
              width='24px'
              height='24px'
            />
          </SCloseButton>
          <SImageContainer>
            <img src={assets.decision.votes} alt='votes' />
          </SImageContainer>
          <SHeadline variant={4}>
            {t('McPost.OptionsTab.OptionCard.ConfirmVoteModal.custom')}
          </SHeadline>
          <SCreatorsText variant={2}>
            {t(
              'McPost.OptionsTab.OptionCard.ConfirmVoteModal.body_custom_votes',
              { creator: postCreator }
            )}
          </SCreatorsText>
          <SCaption variant={3}>
            {t('McPost.OptionsTab.OptionCard.ConfirmVoteModal.option_caption')}
          </SCaption>
          <SOptionText variant={2}>{optionText}</SOptionText>
          <VotesAmountInputModal
            value={supportVotesAmount}
            inputAlign='left'
            placeholder={
              minAmount > 1
                ? t(
                    'McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes'
                  )
                : t(
                    'McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote'
                  )
            }
            pseudoPlaceholder={
              !supportVotesAmount || parseInt(supportVotesAmount) > 1
                ? t(
                    'McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes'
                  )
                : t(
                    'McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote'
                  )
            }
            onChange={(newValue: string) =>
              handleSetSupportVotesAmount(newValue)
            }
            bottomPlaceholder={
              !supportVotesAmount || parseInt(supportVotesAmount) === 1
                ? `${1} ${t(
                    'McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote'
                  )} = $ ${1 * votePrice}`
                : `${supportVotesAmount} ${t(
                    'McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes'
                  )} = $ ${parseInt(supportVotesAmount) * votePrice}`
            }
            minAmount={minAmount}
          />
          <SVoteButton
            view='primary'
            disabled={
              !supportVotesAmount || parseInt(supportVotesAmount) < minAmount
            }
            onClick={() => handleOpenPaymentModal()}
          >
            {t('McPost.OptionsTab.OptionCard.ConfirmVoteModal.voteBtn')}
          </SVoteButton>
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

McConfirmVoteModal.defaultProps = {};

export default McConfirmVoteModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SContentContainer = styled.div`
  position: relative;
  width: calc(100% - 32px);
  max-height: 582px;

  margin: auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  padding: 16px;

  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: fit-content;
    max-height: initial;
  }

  ${({ theme }) => theme.media.tablet} {
    padding: 32px;
    padding-top: 16px;
  }
`;

const SImageContainer = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 40px;
  margin-top: 44px;
`;

const SHeadline = styled(Headline)`
  margin-bottom: 16px;
`;

const SCreatorsText = styled(Text)`
  margin-bottom: 16px;
`;

const SCaption = styled(Text)`
  opacity: 0.6;
`;

const SOptionText = styled(Text)``;

const SVoteButton = styled(Button)`
  margin-left: auto;
  margin-right: auto;
  margin-top: 24px;
`;

const SCloseButton = styled(Button)`
  position: absolute;
  right: 16px;

  background: transparent;
`;
