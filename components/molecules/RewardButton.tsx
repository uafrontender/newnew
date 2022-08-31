import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';

import InlineSvg from '../atoms/InlineSVG';
import ArrowLeftIcon from '../../public/images/svg/icons/outlined/ArrowRight.svg';
import { formatNumber } from '../../utils/format';
import GenericSkeleton from './GenericSkeleton';

interface RewardButtonI {
  balance: number | undefined;
  loading?: boolean;
  offer?: boolean;
}

const REWARD_TICKS = 4;

const RewardButton: React.FC<RewardButtonI> = ({ balance, loading, offer }) => {
  const theme = useTheme();
  const [portion, setPortion] = useState(offer ? 0 : REWARD_TICKS);

  useEffect(() => {
    if (!offer || loading) {
      return () => {};
    }

    const interval = setInterval(() => {
      setPortion((curr) => {
        const newPortions = curr + 1;
        if (newPortions >= REWARD_TICKS) {
          clearInterval(interval);
          return REWARD_TICKS;
        }

        return newPortions;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [balance, loading, offer]);

  if (loading) {
    return <SGenericSkeleton />;
  }

  return (
    <Link href='/rewards'>
      <Container>
        <Value>
          {balance !== undefined
            ? `${formatNumber(balance * (portion / REWARD_TICKS))}`
            : null}
        </Value>
        <ArrowContainer>
          <Arrow>
            <InlineSvg
              svg={ArrowLeftIcon}
              width='24px'
              height='24px'
              fill={theme.colorsThemed.text.primary}
            />
          </Arrow>
        </ArrowContainer>
      </Container>
    </Link>
  );
};

RewardButton.defaultProps = {
  offer: undefined,
};

export default RewardButton;

const SGenericSkeleton = styled(GenericSkeleton)`
  height: 36px;
  min-width: 84px;
  border-radius: 16px;

  ${(props) => props.theme.media.tablet} {
    min-width: 96px;
    height: 48px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  min-width: 84px;
  border: 1px solid;
  border-color: ${(props) => props.theme.colorsThemed.text.primary};
  border-radius: 16px;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  padding: 0px 12px 0px 8px;
  cursor: pointer;

  :hover {
    span {
      left: 4px;
    }
  }

  ${(props) => props.theme.media.tablet} {
    min-width: 96px;
    padding: 0px 16px;
    height: 48px;
  }
`;

const Value = styled.div`
  font-size: 14px;
  line-height: 24px;
  font-weight: 700;

  ${(props) => props.theme.media.tablet} {
    margin-right: 4px;
  }
`;

const ArrowContainer = styled.div`
  position: relative;
`;

const Arrow = styled.span`
  position: relative;
  left: 0px;
  transition: left 500ms;
`;
