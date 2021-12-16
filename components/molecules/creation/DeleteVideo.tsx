import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';

interface IDeleteVideo {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

export const DeleteVideo: React.FC<IDeleteVideo> = (props) => {
  const {
    open,
    handleClose,
    handleSubmit,
  } = props;
  const { t } = useTranslation('creation');

  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Modal
      show={open}
      onClose={handleClose}
    >
      <SMobileContainer onClick={preventCLick}>
        <STitle variant={6}>
          {t('secondStep.modal.deleteFile.title')}
        </STitle>
        <SDescription variant={2} weight={500}>
          {t('secondStep.modal.deleteFile.description')}
        </SDescription>
        <SButtonsHolder>
          <Button view="secondary" onClick={handleClose}>
            {t('secondStep.button.cancel')}
          </Button>
          <Button view="danger" onClick={handleSubmit}>
            {t('secondStep.button.delete')}
          </Button>
        </SButtonsHolder>
      </SMobileContainer>
    </Modal>
  );
};

export default DeleteVideo;

const SMobileContainer = styled.div`
  top: 50%;
  margin: 0 16px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  transform: translateY(-50%);
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: 16px;
`;

const SButtonsHolder = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const STitle = styled(Headline)`
  margin-bottom: 16px;
`;

const SDescription = styled(Text)`
  margin-bottom: 24px;
`;
