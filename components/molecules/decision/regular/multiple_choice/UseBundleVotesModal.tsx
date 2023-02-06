import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Button from '../../../../atoms/Button';
import Modal from '../../../../organisms/Modal';
import assets from '../../../../../constants/assets';
import ModalPaper from '../../../../organisms/ModalPaper';
import { formatNumber } from '../../../../../utils/format';

interface IUseBundleVotesModal {
  show: boolean;
  optionText: string;
  bundleVotesLeft: number;
  handleVoteWithBundleVotes: (voteCount: number) => void;
  onClose: () => void;
}

const UseBundleVotesModal: React.FC<IUseBundleVotesModal> = ({
  show,
  optionText,
  bundleVotesLeft,
  handleVoteWithBundleVotes,
  onClose,
}) => {
  const { t } = useTranslation('page-Post');
  const [votesToUse, setVotesToUse] = useState<number | undefined>(
    bundleVotesLeft
  );

  // Clean when hidden
  useEffect(() => {
    if (!show) {
      setVotesToUse(bundleVotesLeft);
    }
  }, [show, bundleVotesLeft]);

  return (
    <Modal show={show} overlaydim additionalz={12} onClose={onClose}>
      <SModalPaper onClose={onClose} isCloseButton>
        <SContainer>
          <SBundleIcon src={assets.decision.votes} alt='votes' />
          <SVotesAvailable>
            <Trans
              t={t}
              i18nKey='mcPost.optionsTab.useBundleVotesModal.votesAvailable'
              // @ts-ignore
              components={[
                <VotesNumberSpan />,
                { amount: formatNumber(bundleVotesLeft as number, true) },
              ]}
            />
          </SVotesAvailable>
          <OptionTitle>
            {t('mcPost.optionsTab.useBundleVotesModal.optionTitle')}
          </OptionTitle>
          <OptionText>{optionText}</OptionText>
          <SInputWrapper>
            <SInput
              id='bundle-votes-number'
              value={votesToUse}
              inputMode='numeric'
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
              onBlur={() => {
                if (votesToUse && votesToUse > bundleVotesLeft) {
                  setVotesToUse(bundleVotesLeft);
                }
              }}
            />
          </SInputWrapper>
          <SDoneButton
            id='use-bundle-votes'
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
        </SContainer>
      </SModalPaper>
    </Modal>
  );
};

export default UseBundleVotesModal;

const SModalPaper = styled(ModalPaper)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px;

  max-width: 480px;
`;

const SContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SBundleIcon = styled.img`
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
  color: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.text.primary
      : theme.colorsThemed.accent.yellow};
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
  margin-bottom: 24px;
  padding: 11px 20px;

  ${({ theme }) => theme.media.tablet} {
    padding: 11px;
    width: 280px;
    margin-bottom: 30px;
  }
`;

const SInput = styled.input`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  margin: 0 8px;
  outline: none;
  font-size: 16px;
  background: transparent;
  font-weight: 500;
  line-height: 24px;

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }
`;

const SDoneButton = styled(Button)`
  width: fit-content;
  min-width: 140px;

  margin-left: auto;
  margin-right: auto;
`;
