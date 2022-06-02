import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import Button from '../../atoms/Button';
import Modal from '../../organisms/Modal';
import Text from '../../atoms/Text';
import { checkCanDeleteAcOption } from '../../../api/endpoints/auction';
import { checkCanDeleteMcOption } from '../../../api/endpoints/multiple_choice';

interface IOptionModal {
  isOpen: boolean;
  zIndex: number;
  optionId?: number;
  optionCreatorUuid?: string;
  optionType?: 'ac' | 'mc';
  isMyOption?: boolean;
  onClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenRemoveOptionModal?: () => void;
}

const OptionModal: React.FunctionComponent<IOptionModal> = ({
  isOpen,
  zIndex,
  optionId,
  optionCreatorUuid,
  optionType,
  isMyOption,
  onClose,
  handleOpenReportOptionModal,
  handleOpenRemoveOptionModal,
}) => {
  const { t } = useTranslation('decision');

  const [canDeleteOption, setCanDeleteOption] = useState(false);
  const [isCanDeleteOptionLoading, setIsCanDeleteOptionLoading] =
    useState(false);

  useEffect(() => {
    async function fetchCanDelete() {
      setIsCanDeleteOptionLoading(true);
      try {
        let canDelete = false;
        if (optionType === 'ac') {
          const payload = new newnewapi.CanDeleteAcOptionRequest({
            optionId,
          });

          const res = await checkCanDeleteAcOption(payload);

          if (res.data) {
            canDelete = res.data.canDelete;
          }
        } else {
          const payload = new newnewapi.CanDeleteMcOptionRequest({
            optionId,
          });

          const res = await checkCanDeleteMcOption(payload);

          if (res.data) {
            canDelete = res.data.canDelete;
          }
        }

        setCanDeleteOption(canDelete);
      } catch (err) {
        console.error(err);
      }
      setIsCanDeleteOptionLoading(false);
    }

    if (isOpen && isMyOption) {
      fetchCanDelete();
    }
  }, [isOpen, isMyOption, optionType, optionId, optionCreatorUuid]);

  return (
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isMyOption && (
            <SButton
              view='secondary'
              disabled={!canDeleteOption || isCanDeleteOptionLoading}
              onClick={() => {
                handleOpenRemoveOptionModal?.();
                onClose();
              }}
            >
              <Text variant={2} tone='error'>
                {t('ellipse-option.delete-option')}
              </Text>
            </SButton>
          )}
          {!isMyOption && (
            <SButton
              view='secondary'
              onClick={() => {
                handleOpenReportOptionModal();
                onClose();
              }}
            >
              <Text variant={2} tone='error'>
                {t('ellipse-option.report-option')}
              </Text>
            </SButton>
          )}
        </SContentContainer>
        <Button
          view='secondary'
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
          onClick={() => onClose()}
        >
          <Text variant={2}>{t('ellipse.cancel')}</Text>
        </Button>
      </SWrapper>
    </Modal>
  );
};

OptionModal.defaultProps = {
  optionId: undefined,
  optionCreatorUuid: undefined,
  optionType: undefined,
  isMyOption: undefined,
  handleOpenRemoveOptionModal: undefined,
};

export default OptionModal;

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
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 1;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const SButton = styled(Button)`
  border: transparent;

  text-align: center;

  cursor: pointer;

  height: 56px;

  &:focus,
  &:hover {
    outline: none;
  }

  &:focus:enabled,
  &:hover:enabled {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
