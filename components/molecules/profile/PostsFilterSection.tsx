import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../redux-store/store';
import Text from '../../atoms/Text';

import ProfilePostTypeFilterMenu from './ProfilePostTypeFilterMenu';
import ProfilePostTypeFilterModal from './ProfilePostTypeFilterModal';
import Button from '../../atoms/Button';

export type PostsFilterOption = {
  nameToken: string;
  value: newnewapi.Post.Filter;
};

interface IPostsFilterSection {
  numDecisions?: number;
  postsFilter: newnewapi.Post.Filter;
  handleUpdateFilter: (value: newnewapi.Post.Filter) => void;
}

const PostsFilterSection: React.FunctionComponent<IPostsFilterSection> = ({
  numDecisions,
  postsFilter,
  handleUpdateFilter,
}) => {
  const { t } = useTranslation('profile');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <SFiltersSection>
      <Text
        variant={3}
      >
        {numDecisions && (
          <>
            {numDecisions}
            {' '}
            { t('posts-filter.decisions') }
          </>
        )}
        {' '}
      </Text>
      <SFilterButton
        onClick={() => setFilterOpen(true)}
      >
        { t(`posts-filter.filter-${postsFilter?.toString() ?? '0'}`) }
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
};

export default PostsFilterSection;

const SFiltersSection = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
`;

const SFilterButton = styled(Button)`

`;
