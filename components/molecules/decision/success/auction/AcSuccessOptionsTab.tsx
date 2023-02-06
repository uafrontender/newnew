/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../../redux-store/store';
import GoBackButton from '../../../GoBackButton';
import useAcOptions, {
  TAcOptionWithHighestField,
} from '../../../../../utils/hooks/useAcOptions';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import AcOptionCard from '../../regular/auction/AcOptionCard';
import Button from '../../../../atoms/Button';
import GradientMask from '../../../../atoms/GradientMask';
import { Mixpanel } from '../../../../../utils/mixpanel';
import getDisplayname from '../../../../../utils/getDisplayname';

interface IAcSuccessOptionsTab {
  post: newnewapi.Auction;
  handleGoBack: () => void;
}

const AcSuccessOptionsTab: React.FunctionComponent<IAcSuccessOptionsTab> = ({
  post,
  handleGoBack,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { user } = useAppSelector((state) => state);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Options
  const {
    processedOptions: options,
    hasNextPage: hasNextOptionsPage,
    fetchNextPage: fetchNextOptionsPage,
  } = useAcOptions(
    {
      postUuid: post.postUuid,
      userUuid: user.userData?.userUuid,
      loggedInUser: user.loggedIn,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } =
    useScrollGradients(containerRef);

  useEffect(() => {
    if (inView) {
      fetchNextOptionsPage();
    }
  }, [inView, fetchNextOptionsPage]);

  return (
    <SWrapper>
      <GoBackButton onClick={handleGoBack}>
        {t('acPostSuccess.optionsTab.backButton')}
      </GoBackButton>
      {!isMobile && <SSeparator />}
      <SBidsContainer
        ref={(el) => {
          containerRef.current = el!!;
        }}
        heightDelta={isMobile ? 24 : 60}
      >
        {!isMobile ? (
          <>
            <GradientMask
              gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
              positionTop
              active={showTopGradient}
            />
            <GradientMask
              gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
              positionBottom={0}
              active={showBottomGradient}
            />
          </>
        ) : null}
        {options.map((option, i) => (
          <AcOptionCard
            key={option.id.toString()}
            option={option as TAcOptionWithHighestField}
            postUuid={post.postUuid}
            postShortId={post.postShortId ?? ''}
            postCreatorName={getDisplayname(post.creator)}
            postText=''
            postDeadline=''
            index={i}
            minAmount={0}
            votingAllowed={false}
            handleSetSupportedBid={() => {}}
            handleAddOrUpdateOptionFromResponse={() => {}}
          />
        ))}
        {hasNextOptionsPage ? (
          !isMobile ? (
            <SLoaderDiv ref={loadingRef} />
          ) : (
            <SLoadMoreBtn
              view='secondary'
              onClickCapture={() => {
                Mixpanel.track('Click Load More', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'AcSuccessOptionsTab',
                });
              }}
              onClick={() => fetchNextOptionsPage()}
            >
              {t('loadMoreButton')}
            </SLoadMoreBtn>
          )
        ) : null}
      </SBidsContainer>
    </SWrapper>
  );
};

export default AcSuccessOptionsTab;

const SWrapper = styled.div`
  ${({ theme }) => theme.media.tablet} {
    padding: 16px;
  }
`;

const SSeparator = styled.div`
  margin: 16px auto;

  height: 1.5px;
  width: 100%;

  border-bottom: 1.5px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const SBidsContainer = styled.div<{
  heightDelta: number;
}>`
  position: relative;

  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  padding-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    height: ${({ heightDelta }) => `calc(100% - ${heightDelta}px + 10px)`};
    padding-right: 12px;
    margin-right: -14px;
    width: calc(100% + 14px);

    // Scrollbar
    &::-webkit-scrollbar {
      width: 4px;
    }
    scrollbar-width: none;
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }
    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }

    &:hover {
      scrollbar-width: thin;
      &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colorsThemed.background.outlines1};
      }

      &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colorsThemed.background.outlines2};
      }
    }
  }

  ${({ theme }) => theme.media.laptop} {
    height: ${({ heightDelta }) => `calc(100% - ${heightDelta}px)`};
  }
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)`
  width: 100%;
  height: 56px;
`;
