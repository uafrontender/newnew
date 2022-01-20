import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../../atoms/Text';
import { PostsFilterOption } from './PostsFilterSection';

interface IProfilePostTypeFilterMenu {
  isVisible: boolean;
  selected: newnewapi.Post.Filter;
  handleSelect: (value: newnewapi.Post.Filter) => void;
  handleClose: () => void;
}

const ProfilePostTypeFilterMenu: React.FunctionComponent<IProfilePostTypeFilterMenu> = ({
  isVisible,
  selected,
  handleSelect,
  handleClose,
}) => {
  const { t } = useTranslation('profile');
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

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
    handleClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <SContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default ProfilePostTypeFilterMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: calc(100% - 10px);
  z-index: 2;
  right: 16px;
  width: 216px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.laptop} {
    right: 16px;
  }
`;

const SButton = styled.button<{
  selected: boolean;
}>`
  background: none;
  border: transparent;

  cursor: pointer;

  color: ${({ selected, theme }) => (selected ? theme.colorsThemed.text.primary : 'initial')} !important;

  &:focus {
    outline: none;
  }
`;
