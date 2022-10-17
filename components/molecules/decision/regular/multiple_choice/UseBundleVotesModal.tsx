import React, { useState } from 'react';
import { Trans, useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Button from '../../../../atoms/Button';
import Modal from '../../../../organisms/Modal';
import assets from '../../../../../constants/assets';

interface IUseBundleVotesModal {
  isVisible: boolean;
  optionText: string;
  bundleVotesLeft: number;
  handleVoteWithBundleVotes: (voteCount: number) => void;
  closeModal: () => void;
}

const UseBundleVotesModal: React.FC<IUseBundleVotesModal> = ({
  isVisible,
  optionText,
  bundleVotesLeft,
  handleVoteWithBundleVotes,
  closeModal,
}) => {
  const { t } = useTranslation('modal-Post');
  const [votesToUse, setVotesToUse] = useState<number | undefined>(
    bundleVotesLeft
  );

  return (
    <Modal show={isVisible} overlaydim additionalz={12} onClose={closeModal}>
      <SContainer>
        <SModal>
          <BundleIcon
            // TODO: change to single ticket asset from AWS
            src={assets.decision.votes}
            alt='votes'
          />
          <SVotesAvailable>
            <Trans
              t={t}
              i18nKey='mcPost.optionsTab.useBundleVotesModal.votesAvailable'
              // @ts-ignore
              components={[<VotesNumberSpan />, { amount: bundleVotesLeft }]}
            />
          </SVotesAvailable>
          <OptionTitle>
            {t('mcPost.optionsTab.useBundleVotesModal.optionTitle')}
          </OptionTitle>
          <OptionText>{optionText}</OptionText>
          <SInputWrapper>
            <SInput
              value={votesToUse}
              onChange={(e: any) => {
                if (e.target.value === '') {
                  setVotesToUse(undefined);
                  return;
                }

                const newValue = parseInt(e.target.value);

                if (!Number.isNaN(newValue)) {
                  setVotesToUse(newValue);
                }
              }}
            />
          </SInputWrapper>
          <SDoneButton
            view='primaryGrad'
            disabled={
              !(votesToUse && votesToUse > 0 && votesToUse <= bundleVotesLeft)
            }
            onClick={() => {
              if (
                votesToUse &&
                votesToUse > 0 &&
                votesToUse <= bundleVotesLeft
              ) {
                handleVoteWithBundleVotes(votesToUse);
              }
            }}
          >
            {t('mcPost.optionsTab.useBundleVotesModal.button')}
          </SDoneButton>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default UseBundleVotesModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  max-width: 480px;
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  padding: 32px;
  box-sizing: border-box;

  line-height: 24px;
`;

const BundleIcon = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 30px;
`;

const SVotesAvailable = styled.h2`
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 32px;
  line-height: 40px;
  font-weight: 700;

  margin-bottom: 16px;
`;

const VotesNumberSpan = styled.span`
  color: ${({ theme }) => theme.colorsThemed.accent.yellow};
`;

const OptionTitle = styled.p`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  font-size: 14px;
  line-height: 24px;

  margin-bottom: 6px;
`;

const OptionText = styled.p`
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  text-align: center;

  margin-bottom: 16px;
`;

const SInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
  border: 1px solid;
  border-radius: 16px;
  background: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};
  width: 100%;
  margin-bottom: 48px;
  padding: 6.5px;

  ${({ theme }) => theme.media.tablet} {
    padding: 11px;
    width: 280px;
  }
`;

const SInput = styled.input`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  margin: 0 8px;
  outline: none;
  font-size: 14px;
  background: transparent;
  font-weight: 500;
  line-height: 24px;

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }
`;

const SDoneButton = styled(Button)`
  width: fit-content;

  margin-left: auto;
  margin-right: auto;
`;
