import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import { PostsFilterOption } from './PostsFilterSection';

interface IProfilePostTypeFilterModal {
  isOpen: boolean;
  zIndex: number;
  selected: newnewapi.Post.Filter;
  handleSelect: (value: newnewapi.Post.Filter) => void;
  onClose: () => void;
}

const ProfilePostTypeFilterModal: React.FunctionComponent<IProfilePostTypeFilterModal> = ({
  isOpen,
  zIndex,
  selected,
  handleSelect,
  onClose,
}) => {
  const { t } = useTranslation('profile');

  const options: PostsFilterOption[] = useMemo(() => (
    [
      {
        nameToken: '0',
        value: newnewapi.Post.Filter.ALL,
      },
      {
        nameToken: '1',
        value: newnewapi.Post.Filter.AUCTIONS,
      },
      {
        nameToken: '3',
        value: newnewapi.Post.Filter.MULTIPLE_CHOICES,
      },
      {
        nameToken: '2',
        value: newnewapi.Post.Filter.CROWDFUNDINGS,
      },
    ]
  ), []);

  const handleClick = (value: newnewapi.Post.Filter) => {
    // @ts-ignore
    handleSelect(value.toString());
    onClose();
  };

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
          {options.map((o) => (
            <SButton
              selected={o.value === selected}
              onClick={() => handleClick(o.value)}
              style={{
                marginBottom: '16px',
              }}
            >
              <Text
                variant={3}
              >
                { t(`posts-filter.filter-${o.nameToken}`) }
              </Text>
            </SButton>
          ))}
        </SContentContainer>
        <Button
          view="secondary"
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
        >
          {t('Cancel')}
        </Button>
      </SWrapper>
    </Modal>
  );
};

export default ProfilePostTypeFilterModal;

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
  padding-bottom: 30px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const SButton = styled.button<{
  selected: boolean;
}>`
  background: ${({ selected, theme }) => (selected ? theme.colorsThemed.background.secondary : 'transparent')};
  border: transparent;

  text-align: center;

  cursor: pointer;

  &:focus {
    outline: none;
  }
`;
