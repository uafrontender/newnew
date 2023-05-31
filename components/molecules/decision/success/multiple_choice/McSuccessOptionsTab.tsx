/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../../redux-store/store';
import GoBackButton from '../../../GoBackButton';
import useMcOptions, {
  TMcOptionWithHighestField,
} from '../../../../../utils/hooks/useMcOptions';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import McOptionCard from '../../regular/multiple_choice/McOptionCard';
import Button from '../../../../atoms/Button';
import GradientMask from '../../../../atoms/GradientMask';
import { Mixpanel } from '../../../../../utils/mixpanel';

import Lottie from '../../../../atoms/Lottie';
import loadingAnimation from '../../../../../public/animations/logo-loading-blue.json';
import { useAppState } from '../../../../../contexts/appStateContext';

interface IMcSuccessOptionsTab {
  post: newnewapi.MultipleChoice;
  handleGoBack: () => void;
}

const McSuccessOptionsTab: React.FunctionComponent<IMcSuccessOptionsTab> = ({
  post,
  handleGoBack,
}) => {
  const theme = useTheme();
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
    isLoading: optionsLoading,
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
      <SGoBackButton onClick={handleGoBack}>
        {t('acPostSuccess.optionsTab.backButton')}
      </SGoBackButton>
      {!isMobile && <SSeparator />}
      {!isMobile ? (
        <>
          <GradientMask
            gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
            positionTop={60}
            active={showTopGradient}
          />
          <GradientMask
            gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
            positionBottom={0}
            active={showBottomGradient}
          />
        </>
      ) : null}
      {options.length === 0 && optionsLoading ? (
        <SNoOptionsYet>
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        </SNoOptionsYet>
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
                  _component: 'McSuccessOptionsTab',
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

export default McSuccessOptionsTab;

const SGoBackButton = styled(GoBackButton)``;

const SWrapper = styled.div`
  height: 100%;
  position: relative;
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

const SBidsContainer = styled.div`
  position: relative;

  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  padding-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    height: calc(100% - 60px);
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
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)`
  width: 100%;
  height: 56px;
`;

// No options yet
const SNoOptionsYet = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  min-height: 300px;

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
  }

  ${({ theme }) => theme.media.laptop} {
    min-height: 400px;
  }
`;
