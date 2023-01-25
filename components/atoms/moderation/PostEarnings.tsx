/* eslint-disable no-nested-ternary */
import React from 'react';
import styled, { useTheme } from 'styled-components';

import Headline from '../Headline';
import Text from '../Text';
import GenericSkeleton from '../../molecules/GenericSkeleton';

interface IPostEarning {
  amount: string | undefined;
  label: string;
  isEarnedAmountFetched?: boolean;
  loading?: boolean;
}

const PostEarnings: React.FunctionComponent<IPostEarning> = ({
  amount,
  label,
  isEarnedAmountFetched,
  loading,
}) => {
  const theme = useTheme();

  if (isEarnedAmountFetched && !amount) {
    return null;
  }

  if (amount === '0') {
    return null;
  }

  if (!amount || loading) {
    return (
      <SSkeletonContainer>
        <SLabelSkeleton
          bgColor={theme.colorsThemed.background.secondary}
          highlightColor={theme.colorsThemed.background.quaternary}
        />
        <SEarningsSkeleton
          bgColor={theme.colorsThemed.background.secondary}
          highlightColor={theme.colorsThemed.background.quaternary}
        />
      </SSkeletonContainer>
    );
  }

  return (
    <>
      <Text variant={2} weight={600}>
        {label}
      </Text>
      <SAmountHeadline id='post-earnings' variant={1}>
        ${amount}
      </SAmountHeadline>
    </>
  );
};

export default PostEarnings;

const SAmountHeadline = styled(Headline)``;

const SSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SGenericSkeleton = styled(GenericSkeleton)`
  margin-right: 2px;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};
`;

const SLabelSkeleton = styled(SGenericSkeleton)`
  width: 75px;
  height: 20px;
  margin-bottom: 4px;

  ${({ theme }) => theme.media.tablet} {
    height: 24px;
  }
`;

const SEarningsSkeleton = styled(SGenericSkeleton)`
  width: 120px;
  height: 36px;

  ${({ theme }) => theme.media.tablet} {
    height: 44px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 60px;
  }
`;
