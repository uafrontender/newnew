import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../redux-store/store';
import Text from '../../atoms/Text';

import ProfilePostTypeFilterMenu from './ProfilePostTypeFilterMenu';
import ProfilePostTypeFilterModal from './ProfilePostTypeFilterModal';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import ArrowDown from '../../../public/images/svg/icons/filled/ArrowDown.svg';

export type PostsFilterOption = {
  nameToken: string;
  value: newnewapi.Post.Filter;
};

interface IPostsFilterSection {
  numDecisions?: number;
  isLoading?: boolean;
  postsFilter: newnewapi.Post.Filter;
  handleUpdateFilter: (value: newnewapi.Post.Filter) => void;
}

const PostsFilterSection: React.FunctionComponent<IPostsFilterSection> = ({
  numDecisions,
  isLoading,
  postsFilter,
  handleUpdateFilter,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('profile');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <SFiltersSection>
      <Text
        variant={3}
      >
        {(numDecisions && numDecisions !== 0) ? (
          <>
            {numDecisions}
            {' '}
            { t('posts-filter.decisions') }
          </>
        ) : null}
        {((!numDecisions || numDecisions === 0) && !isLoading) ? (
          <>
            { t('posts-filter.no-decisions') }
          </>
        ) : null}
        {' '}
      </Text>
      <SFilterButton
        view="secondary"
        onClick={() => setFilterOpen(true)}
      >
        <span>
          { t(`posts-filter.filter-${postsFilter?.toString() ?? '0'}`) }
        </span>
        <InlineSvg
          svg={ArrowDown}
          fill={theme.colorsThemed.text.secondary}
          width="24px"
          height="24px"
        />
      </SFilterButton>
      {!isMobile ? (
        <ProfilePostTypeFilterMenu
          isVisible={filterOpen}
          selected={postsFilter}
          handleSelect={handleUpdateFilter}
          handleClose={() => setFilterOpen(false)}
        />
      ) : null}
      {isMobile ? (
        <ProfilePostTypeFilterModal
          isOpen={filterOpen}
          zIndex={10}
          selected={postsFilter}
          handleSelect={handleUpdateFilter}
          onClose={() => setFilterOpen(false)}
        />
      ) : null}
    </SFiltersSection>
  );
};

PostsFilterSection.defaultProps = {
  numDecisions: undefined,
  isLoading: undefined,
};

export default PostsFilterSection;

const SFiltersSection = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0 16px !important;

  ${({ theme }) => theme.media.tablet} {
    padding: initial !important;
  }
`;

const SFilterButton = styled(Button)`
  span {
    display: flex;
  }
`;
