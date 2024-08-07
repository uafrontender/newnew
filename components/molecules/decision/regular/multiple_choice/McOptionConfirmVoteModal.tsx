import React, { useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { Trans, useTranslation } from 'next-i18next';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import Modal, { ModalType } from '../../../../organisms/Modal';
import Headline from '../../../../atoms/Headline';

// Icons
import CancelIcon from '../../../../../public/images/svg/icons/outlined/Close.svg';
import InlineSvg from '../../../../atoms/InlineSVG';
import assets from '../../../../../constants/assets';
import { Mixpanel } from '../../../../../utils/mixpanel';
import VotesAmountInputModal from '../../../../atoms/decision/VotesAmountInputModal';
import { usePostInnerState } from '../../../../../contexts/postInnerContext';
import DisplayName from '../../../../atoms/DisplayName';

interface IMcConfirmVoteModal {
  show: boolean;
  zIndex: number;
  optionText: string;
  supportVotesAmount: string;
  customSupportVotesAmount: string;
  customPaymentWithFeeInCents: number;
  isAmountPredefined: boolean;
  minAmount: number;
  modalType?: ModalType;
  onClose: () => void;
  handleOpenPaymentModal: () => void;
  handleSetSupportVotesAmount: (newAmount: string) => void;
}

const McOptionConfirmVoteModal: React.FC<IMcConfirmVoteModal> = ({
  show,
  zIndex,
  optionText,
  supportVotesAmount,
  isAmountPredefined,
  customSupportVotesAmount,
  customPaymentWithFeeInCents,
  minAmount,
  modalType,
  onClose,
  handleOpenPaymentModal,
  handleSetSupportVotesAmount,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');

  const { postParsed } = usePostInnerState();

  const postCreator = useMemo(() => postParsed?.creator, [postParsed]);

  if (!isAmountPredefined) {
    return (
      <Modal
        show={show}
        modalType={modalType}
        additionalz={zIndex}
        onClose={onClose}
      >
        <SWrapper>
          <SContentContainer
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <SCloseButton
              iconOnly
              view='transparent'
              onClick={onClose}
              onClickCapture={() => {
                Mixpanel.track('Close McConfirmVoteModal', {
                  _stage: 'Post',
                  _component: 'McConfirmVoteModal',
                });
              }}
            >
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCloseButton>
            <SHeadline variant={4}>
              {t('mcPost.optionsTab.optionCard.confirmVoteModal.custom')}
            </SHeadline>
            <SCreatorsText variant={2}>
              <Trans
                t={t}
                i18nKey='mcPost.optionsTab.optionCard.confirmVoteModal.buyAnyVotes'
                components={[
                  <DisplayName
                    user={postCreator}
                    suffix={t(
                      'mcPost.optionsTab.optionCard.confirmVoteModal.suffix'
                    )}
                  />,
                ]}
              />
            </SCreatorsText>
            <SCaption variant={3}>
              {t('mcPost.optionsTab.optionCard.confirmVoteModal.optionCaption')}
            </SCaption>
            <SOptionText variant={2}>{optionText}</SOptionText>
            <VotesAmountInputModal
              value={customSupportVotesAmount}
              customPaymentWithFeeInCents={customPaymentWithFeeInCents}
              onChange={(newValue: string) =>
                handleSetSupportVotesAmount(newValue)
              }
              minAmount={minAmount}
            />
            <SVoteButton
              id='custom-votes-submit'
              view='primary'
              disabled={
                !customSupportVotesAmount ||
                parseInt(customSupportVotesAmount) < minAmount
              }
              onClickCapture={() => {
                Mixpanel.track('Submit Votes Amount and Open Payment Modal', {
                  _stage: 'Post',
                  _component: 'McConfirmVoteModal',
                });
              }}
              onClick={() => handleOpenPaymentModal()}
            >
              {t('mcPost.optionsTab.optionCard.confirmVoteModal.voteButton')}
            </SVoteButton>
          </SContentContainer>
        </SWrapper>
      </Modal>
    );
  }

  return (
    <Modal
      show={show}
      modalType={modalType}
      additionalz={zIndex}
      onClose={onClose}
    >
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <SCloseButton
            iconOnly
            view='transparent'
            onClick={onClose}
            onClickCapture={() => {
              Mixpanel.track('Close McConfirmVoteModal', {
                _stage: 'Post',
                _component: 'McConfirmVoteModal',
              });
            }}
          >
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
              ? t('mcPost.optionsTab.optionCard.confirmVoteModal.vote')
              : t('mcPost.optionsTab.optionCard.confirmVoteModal.votes')}
          </SHeadline>
          <SCreatorsText variant={2}>
            {parseInt(supportVotesAmount) === 1 ? (
              <Trans
                t={t}
                i18nKey='mcPost.optionsTab.optionCard.confirmVoteModal.buySingleVote'
                components={[
                  <DisplayName
                    user={postCreator}
                    suffix={t(
                      'mcPost.optionsTab.optionCard.confirmVoteModal.suffix'
                    )}
                  />,
                ]}
              />
            ) : (
              <Trans
                t={t}
                i18nKey='mcPost.optionsTab.optionCard.confirmVoteModal.buyMultipleVotes'
                // @ts-ignore
                components={[
                  <DisplayName
                    user={postCreator}
                    suffix={t(
                      'mcPost.optionsTab.optionCard.confirmVoteModal.suffix'
                    )}
                  />,
                  {
                    amount: supportVotesAmount,
                  },
                ]}
              />
            )}
          </SCreatorsText>
          <SCaption variant={3}>
            {t('mcPost.optionsTab.optionCard.confirmVoteModal.optionCaption')}
          </SCaption>
          <SOptionText variant={2}>{optionText}</SOptionText>
          <SVoteButton
            id='confirm-vote'
            view='primary'
            onClickCapture={() => {
              Mixpanel.track('Submit Votes Amount and Open Payment Modal', {
                _stage: 'Post',
                _component: 'McConfirmVoteModal',
              });
            }}
            onClick={() => handleOpenPaymentModal()}
          >
            {t('mcPost.optionsTab.optionCard.confirmVoteModal.voteButton')}
          </SVoteButton>
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

McOptionConfirmVoteModal.defaultProps = {};

export default McOptionConfirmVoteModal;

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

  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.secondary
      : theme.colorsThemed.background.primary};
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
  top: 16px;
  right: 16px;

  background: transparent;
`;
