/* eslint-disable no-unused-vars */
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import Text from '../../atoms/Text';

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
  const { t } = useTranslation('profile');

  return (
    <SFiltersSection>
      <SText
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
      </SText>
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
  justify-content: center;
  align-items: center;

  padding: 0 16px !important;

  ${({ theme }) => theme.media.tablet} {
    padding: initial !important;
  }
`;

const SText = styled(Text)`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
