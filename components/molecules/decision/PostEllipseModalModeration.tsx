import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';

interface IPostEllipseModalModeration {
  postType: string;
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  handleOpenDeletePostModal: () => void;
}

const PostEllipseModalModeration: React.FunctionComponent<IPostEllipseModalModeration> = ({
  postType,
  isOpen,
  zIndex,
  onClose,
  handleOpenDeletePostModal,
}) => {
  const { t } = useTranslation('decision');

  return (
    <Modal
      show={isOpen}
      overlayDim
      additionalZ={zIndex}
      onClose={onClose}
    >
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <SButton
            onClick={() => {
              handleOpenDeletePostModal();
              onClose();
            }}
          >
            <Text
              variant={3}
            >
              { t('ellipse.deleteDecision', { postType: t(`postType.${postType}`) })}
            </Text>
          </SButton>
        </SContentContainer>
        <Button
          view="secondary"
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
        >
          { t('ellipse.cancel') }
        </Button>
      </SWrapper>
    </Modal>
  );
};

export default PostEllipseModalModeration;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 16px;
`;

const SContentContainer = styled.div`
  width: calc(100% - 32px);
  height: fit-content;

  display: flex;
  flex-direction: column;

  padding: 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;

  text-align: center;

  cursor: pointer;

  &:focus {
    outline: none;
  }
`;
