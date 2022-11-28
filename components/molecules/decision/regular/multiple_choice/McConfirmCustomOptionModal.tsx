import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import Modal from '../../../../organisms/Modal';
import Headline from '../../../../atoms/Headline';

interface IMcConfirmCustomOptionModal {
  isVisible: boolean;
  handleAddCustomOption: () => void;
  closeModal: () => void;
}

// TODO: Change UI
const McConfirmCustomOptionModal: React.FC<IMcConfirmCustomOptionModal> = ({
  isVisible,
  handleAddCustomOption,
  closeModal,
}) => {
  const { t } = useTranslation('page-Post');

  return (
    <Modal show={isVisible} additionalz={12} onClose={closeModal}>
      <SContainer>
        <SModal>
          <SHeadline variant={5}>
            {t('mcPost.optionsTab.confirmCustomOptionModal.title')}
          </SHeadline>
          <SModalMessage>
            <Text variant={2}>
              {t('mcPost.optionsTab.confirmCustomOptionModal.line_1')}
            </Text>
            <Text variant={2}>
              {t('mcPost.optionsTab.confirmCustomOptionModal.line_2')}
            </Text>
          </SModalMessage>
          <SDoneButton
            id='add-option-confirm'
            view='primaryGrad'
            onClick={() => handleAddCustomOption()}
          >
            {t('mcPost.optionsTab.confirmCustomOptionModal.useFreeVoteButton')}
          </SDoneButton>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default McConfirmCustomOptionModal;

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

const SHeadline = styled(Headline)`
  text-align: center;
  margin-bottom: 18px;
`;

const SModalMessage = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const SDoneButton = styled(Button)`
  width: fit-content;

  margin-left: auto;
  margin-right: auto;
`;
