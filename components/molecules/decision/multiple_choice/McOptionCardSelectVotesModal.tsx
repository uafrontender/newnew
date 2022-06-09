import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';

import { useGetAppConstants } from '../../../../contexts/appConstantsContext';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Modal from '../../../organisms/Modal';
import Headline from '../../../atoms/Headline';
import InlineSvg from '../../../atoms/InlineSVG';

import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';

interface IMcOptionCardSelectVotesModal {
  isVisible: boolean;
  isSupportedByMe: boolean;
  availableVotes: number[];
  handleClose: () => void;
  handleOpenCustomAmountModal: () => void;
  handleSetAmountAndOpenModal: (votesAmount: string) => void;
  children: React.ReactNode;
}

const McOptionCardSelectVotesModal: React.FunctionComponent<IMcOptionCardSelectVotesModal> =
  ({
    isVisible,
    isSupportedByMe,
    availableVotes,
    handleClose,
    handleOpenCustomAmountModal,
    handleSetAmountAndOpenModal,
    children,
  }) => {
    const theme = useTheme();
    const { t } = useTranslation('decision');

    const { appConstants } = useGetAppConstants();

    return (
      <Modal show={isVisible} overlaydim additionalz={10} onClose={handleClose}>
        <SContainer>
          <STitleContainer>
            <STitleText variant={6}>
              {!isSupportedByMe
                ? t('McPost.OptionsTab.OptionCard.selectVotesMenu.title')
                : t(
                    'McPost.OptionsTab.OptionCard.selectVotesMenu.title_more_votes'
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
            {availableVotes.map((amount) => (
              <SButton
                key={amount}
                onClick={() => handleSetAmountAndOpenModal(amount.toString())}
              >
                <Text variant={3}>
                  <SBoldSpan>
                    {amount}{' '}
                    {amount === 1
                      ? t('McPost.OptionsTab.OptionCard.selectVotesMenu.vote')
                      : t('McPost.OptionsTab.OptionCard.selectVotesMenu.votes')}
                  </SBoldSpan>{' '}
                  <SOpaqueSpan>
                    {`($${
                      amount * Math.round(appConstants.mcVotePrice / 100)
                    })`}
                  </SOpaqueSpan>
                </Text>
              </SButton>
            ))}
            <SButton onClick={() => handleOpenCustomAmountModal()}>
              <Text variant={3}>
                {t('McPost.OptionsTab.OptionCard.selectVotesMenu.custom')}
              </Text>
            </SButton>
          </SButtonsContainer>
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
