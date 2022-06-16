import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Modal from '../../../organisms/Modal';

interface IMcConfirmUseFreeVoteModal {
  isVisible: boolean;
  handleMakeFreeVote: () => void;
  closeModal: () => void;
}

const McConfirmUseFreeVoteModal: React.FC<IMcConfirmUseFreeVoteModal> = ({
  isVisible,
  handleMakeFreeVote,
  closeModal,
}) => {
  const { t } = useTranslation('modal-Post');

  return (
    <Modal show={isVisible} additionalz={12} onClose={closeModal}>
      <SContainer
      // onClick={(e: any) => e.stopPropagation()}
      >
        <SModal>
          <STag>{t('mcPost.optionsTab.confirmUseFreeVoteModal.tag')}</STag>
          <SModalMessage>
            <Text variant={2}>
              {t('mcPost.optionsTab.confirmUseFreeVoteModal.line_1')}
            </Text>
            <Text variant={2}>
              {t('mcPost.optionsTab.confirmUseFreeVoteModal.line_2')}
            </Text>
            <Text variant={2}>
              {t('mcPost.optionsTab.confirmUseFreeVoteModal.line_3')}
            </Text>
          </SModalMessage>
          <SDoneButton view='primaryGrad' onClick={() => handleMakeFreeVote()}>
            {t('mcPost.optionsTab.confirmUseFreeVoteModal.useFreeVoteButton')}
          </SDoneButton>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default McConfirmUseFreeVoteModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  position: relative;

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
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
`;

const STag = styled.div`
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 24px;

  padding: 11px;

  border-radius: 36px;
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};

  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.dark};

  box-shadow: 0px 20px 90px -3px ${({ theme }) => theme.colorsThemed.accent.yellow};
`;

const SModalMessage = styled.p`
  text-align: center;
  margin-bottom: 24px;
`;

const SDoneButton = styled(Button)`
  width: fit-content;

  margin-left: auto;
  margin-right: auto;
`;
