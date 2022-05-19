/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import Button from '../Button';
import CloseModalButton from './CloseModalButton';

interface IRemoveSubModal {
  confirmEnableSub: boolean;
  closeModal: () => void;
  subEnabled: () => void;
}

const RemoveSubModal: React.FC<IRemoveSubModal> = ({
  confirmEnableSub,
  closeModal,
  subEnabled,
}) => {
  const { t } = useTranslation('creator');
  const handleSubmit = () => {
    subEnabled();
  };

  return (
    <Modal show={confirmEnableSub} onClose={closeModal}>
      <SContainer>
        <SModal onClick={preventParentClick()}>
          <SModalHeader>
            <SModalTitle>{t('removeSubModal.title')}</SModalTitle>
            <SCloseModalButton>
              <CloseModalButton handleClick={closeModal} />
            </SCloseModalButton>
          </SModalHeader>
          <SModalContent>
            <SText>{t('removeSubModal.note')}</SText>
          </SModalContent>
          <SConfirmButton view='danger' onClick={handleSubmit}>
            {t('removeSubModal.bntText')}
          </SConfirmButton>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default RemoveSubModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  text-align: center;
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  padding: 0 16px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
  height: 100%;
  overflow: auto;

  ${(props) => props.theme.media.tablet} {
    height: auto;
    padding: 24px 24px 40px;
    max-width: 480px;
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

const SModalHeader = styled.div`
  position: relative;
  align-items: center;
  margin-bottom: 22px;
  justify-content: space-between;
`;

const SModalTitle = styled.strong`
  font-size: 32px;
  margin: 36px 0 0;
  font-weight: bold;
  text-align: center;
  display: block;
`;

const SCloseModalButton = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

const SModalContent = styled.div``;

const SText = styled.p`
  margin-bottom: 24px;
  white-space: pre-wrap;
`;

const SConfirmButton = styled(Button)`
  padding: 16px 10px;
  line-height: 24px;
  font-size: 16px;
  margin: 0 auto;

  &:disabled {
    cursor: default;
    opacity: 1;
    outline: none;

    :after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 1;
      z-index: 6;
      position: absolute;
      background: ${(props) => props.theme.colorsThemed.button.disabled};
    }
  }
  ${(props) => props.theme.media.tablet} {
    width: auto;
    flex-shrink: 0;
    padding: 16px 24px;
  }
`;
