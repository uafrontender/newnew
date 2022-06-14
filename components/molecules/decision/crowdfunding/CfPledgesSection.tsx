/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useAppSelector } from '../../../../redux-store/store';
import { TCfPledgeWithHighestField } from '../../../organisms/decision/PostViewCF';

import Button from '../../../atoms/Button';
import CfPledgeCard from './CfPledgeCard';

interface ICfPledgesSection {
  post: newnewapi.Crowdfunding;
  pledges: newnewapi.Crowdfunding.Pledge[];
  pledgesLoading: boolean;
  pagingToken: string | undefined | null;
  heightDelta: number;
  handleLoadPledges: (token?: string) => void;
}

const CfPledgesSection: React.FunctionComponent<ICfPledgesSection> = ({
  post,
  pledges,
  pledgesLoading,
  pagingToken,
  heightDelta,
  handleLoadPledges,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  useEffect(() => {
    if (inView && !pledgesLoading && pagingToken) {
      handleLoadPledges(pagingToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, pledgesLoading]);

  return (
    <SSectionContainer
      key='pledges'
      heightDelta={heightDelta}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SPledgesContainer>
        {pledges.map((pledge, i) => (
          <CfPledgeCard
            key={pledge.id.toString()}
            index={i}
            pledge={pledge as TCfPledgeWithHighestField}
            creator={pledge.creator ?? post.creator!!}
          />
        ))}
      </SPledgesContainer>
      {!isMobile ? (
        <SLoaderDiv ref={loadingRef} />
      ) : pagingToken ? (
        <SLoadMoreBtn onClick={() => handleLoadPledges(pagingToken)}>
          {t('loadMoreButton')}
        </SLoadMoreBtn>
      ) : null}
    </SSectionContainer>
  );
};

export default CfPledgesSection;

const SSectionContainer = styled(motion.div)<{
  heightDelta: number;
}>`
  position: relative;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    height: ${({ heightDelta }) => `calc(100% - ${heightDelta}px)`};

    &:after {
      content: '';
      width: 100%;

      position: absolute;
      bottom: 0;
      box-shadow: 0px -50px 18px 0px blue;
      box-shadow: 0px -5px 18px 20px ${({ theme }) => (theme.name === 'dark' ? 'rgba(20, 21, 31, 0.9)' : 'rgba(241, 243, 249, 0.9)')};
      z-index: 10;
    }
  }
`;

const SPledgesContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  /* gap: 16px; */
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)``;
