/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../../redux-store/store';
import useMcOptions, {
  TMcOptionWithHighestField,
} from '../../../../../utils/hooks/useMcOptions';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import McOptionCard from '../../regular/multiple_choice/McOptionCard';
import Button from '../../../../atoms/Button';
import GradientMask from '../../../../atoms/GradientMask';
import { Mixpanel } from '../../../../../utils/mixpanel';
import { useAppState } from '../../../../../contexts/appStateContext';

interface IMcWaitingOptionsSection {
  post: newnewapi.MultipleChoice;
}

const McWaitingOptionsSection: React.FunctionComponent<
  IMcWaitingOptionsSection
> = ({ post }) => {
  const { t } = useTranslation('page-Post');
  const { user } = useAppSelector((state) => state);
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } =
    useScrollGradients(containerRef);

  const {
    processedOptions: options,
    hasNextPage: hasNextOptionsPage,
    fetchNextPage: fetchNextOptionsPage,
  } = useMcOptions(
    {
      postUuid: post.postUuid,
      loggedInUser: user.loggedIn,
      userUuid: user.userData?.userUuid,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (inView) {
      fetchNextOptionsPage();
    }
  }, [inView, fetchNextOptionsPage]);

  return (
    <SWrapper>
      {!isMobile && <SSeparator />}
      {!isMobile ? (
        <>
          <GradientMask
            gradientType='secondary'
            positionTop
            active={showTopGradient}
          />
          <GradientMask
            gradientType='secondary'
            positionBottom={0}
            active={showBottomGradient}
          />
        </>
      ) : null}
      <SBidsContainer
        ref={(el) => {
          containerRef.current = el!!;
        }}
      >
        {options.map((option, i) => (
          <McOptionCard
            key={option.id.toString()}
            option={option as TMcOptionWithHighestField}
            postUuid={post.postUuid}
            postShortId={post.postShortId ?? ''}
            isCreatorsBid={
              !option.creator || option.creator?.uuid === post.creator?.uuid
            }
            postCreator={post.creator}
            postText=''
            index={i}
            noAction
            handleSetPaymentSuccessValue={() => {}}
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
                  _component: 'McWaitingOptionsSection',
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

export default McWaitingOptionsSection;

const SWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  ${({ theme }) => theme.media.tablet} {
    flex: 1 1 auto;
  }
`;

const SSeparator = styled.div`
  margin: 16px auto;

  height: 1.5px;
  width: 100%;

  border-bottom: 1.5px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const SBidsContainer = styled.div`
  position: relative;

  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  padding-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;

    padding-top: 0px;
    padding-right: 12px;
    margin-right: -14px;
    width: calc(100% + 14px);
    height: initial;
    flex: 1 1 auto;

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
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)`
  width: 100%;
  height: 56px;
`;
