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
              selected={o.value.toString() === (selected?.toString() ?? '0')}
              onClick={() => handleClick(o.value)}
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
  top: calc(100%);
  z-index: 2;
  right: 0px;
  width: 216px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.laptop} {
    right: 0;
  }
`;

const SButton = styled.button<{
  selected: boolean;
}>`
  background: none;
  border: transparent;

  width: 100%;

  text-align: left;

  cursor: pointer;

  border-radius: 8px;
  padding: 8px;

  color: ${({ selected, theme }) => (selected ? theme.colorsThemed.text.primary : 'initial')} !important;
  background: ${({ selected, theme }) => (selected ? theme.colorsThemed.background.quinary : 'initial')} !important;

  &:focus {
    outline: none;
  }
`;
