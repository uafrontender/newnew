import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import ModalPaper from '../organisms/ModalPaper';
import Modal from '../organisms/Modal';
import preventParentClick from '../../utils/preventParentClick';
import Button from '../atoms/Button';

interface IReportSuccessModal {
  show: boolean;
  additionalz?: number;
  onClose: () => void;
}

const ReportSuccessModal: React.FC<IReportSuccessModal> = ({
  show,
  additionalz,
  onClose,
}) => {
  const { t } = useTranslation('common');

  return (
    <Modal show={show} onClose={onClose} additionalz={additionalz}>
      <SConformationModal
        onClose={onClose}
        isCloseButton
        onClick={preventParentClick()}
      >
        <SConformationTitle>{t('modal.reportSent.title')}</SConformationTitle>
        <SConformationText>{t('modal.reportSent.subtitle')}</SConformationText>
        <SAcknowledgementButton view='primaryGrad' onClick={onClose}>
          {t('modal.reportSent.button')}
        </SAcknowledgementButton>
      </SConformationModal>
    </Modal>
  );
};

export default ReportSuccessModal;

const SConformationModal = styled(ModalPaper)`
  position: relative;
  padding: 32px 40px 40px 40px;
  margin: auto 16px;
  height: auto;
  max-width: 350px;
  width: 100%;

  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;

    ${(props) => props.theme.media.tablet} {
      font-size: 16px;
    }
  }

  ${(props) => props.theme.media.tablet} {
    max-width: 480px;
  }
`;

const SConformationTitle = styled.strong`
  margin-bottom: 16px;

  font-weight: 700;
  font-size: 20px;
  line-height: 28px;

  ${(props) => props.theme.media.tablet} {
    font-size: 24px;
    line-height: 32px;
  }
`;

const SConformationText = styled.p`
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 24px;
  text-align: center;
  color: ${(props) => props.theme.colorsThemed.text.secondary};

  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SAcknowledgementButton = styled(Button)`
  width: auto;
  flex-shrink: 0;
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;

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
`;
