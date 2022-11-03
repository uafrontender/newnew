import React from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { useAppSelector } from '../../../redux-store/store';

import GoBackButton from '../../molecules/GoBackButton';

const PostSkeleton = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('modal-Post');

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  return (
    <>
      {!isMobile && (
        <SGoBackButton longArrow onClick={() => router.back()}>
          {t('back')}
        </SGoBackButton>
      )}
      <SPostModalContainer>
        <SWrapper>
          {isMobile && <SGoBackButtonMobile onClick={() => router.back()} />}
          <SVideoSkeletonWrapper className='videoSkeletonContainer'>
            <Skeleton
              count={1}
              borderRadius={16}
              duration={2}
              className='videoSkeleton'
              containerClassName='videoSkeletonContainer'
              baseColor={theme.colorsThemed.background.secondary}
              highlightColor={theme.colorsThemed.background.quaternary}
            />
          </SVideoSkeletonWrapper>
          <SActivitiesContainer>
            <Skeleton
              count={1}
              borderRadius={16}
              duration={2}
              className='headingSkeleton'
              containerClassName='headingSkeletonContainer'
              baseColor={theme.colorsThemed.background.quaternary}
              highlightColor={theme.colorsThemed.background.secondary}
            />
            <Skeleton
              count={1}
              borderRadius={16}
              duration={2}
              className='activitiesSkeleton'
              containerClassName='activitiesSkeletonContainer'
              baseColor={theme.colorsThemed.background.quaternary}
              highlightColor={theme.colorsThemed.background.primary}
            />
          </SActivitiesContainer>
        </SWrapper>
      </SPostModalContainer>
    </>
  );
};

export default PostSkeleton;

export const PostSkeletonView = () => {
  const theme = useTheme();
  const router = useRouter();

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  return (
    <>
      <SWrapper>
        {isMobile && <SGoBackButtonMobile onClick={() => router.back()} />}
        <SVideoSkeletonWrapper className='videoSkeletonContainer'>
          <Skeleton
            count={1}
            borderRadius={16}
            duration={2}
            className='videoSkeleton'
            containerClassName='videoSkeletonContainer'
            baseColor={theme.colorsThemed.background.secondary}
            highlightColor={theme.colorsThemed.background.quaternary}
          />
        </SVideoSkeletonWrapper>
        <SActivitiesContainer>
          <Skeleton
            count={1}
            borderRadius={16}
            duration={2}
            className='headingSkeleton'
            containerClassName='headingSkeletonContainer'
            baseColor={theme.colorsThemed.background.quaternary}
            highlightColor={theme.colorsThemed.background.secondary}
          />
          <Skeleton
            count={1}
            borderRadius={16}
            duration={2}
            className='activitiesSkeleton'
            containerClassName='activitiesSkeletonContainer'
            baseColor={theme.colorsThemed.background.quaternary}
            highlightColor={theme.colorsThemed.background.primary}
          />
        </SActivitiesContainer>
      </SWrapper>
    </>
  );
};

const SGoBackButton = styled(GoBackButton)`
  padding-left: 16px;

  ${({ theme }) => theme.media.laptopM} {
    padding-left: 24px;
    width: 100%;
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const SGoBackButtonMobile = styled(GoBackButton)`
  position: absolute;
  left: 0;
  top: 4px;
`;

const SPostModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  height: 100%;
  width: 100%;
  padding: 16px;
  padding-bottom: 86px;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    padding-bottom: 16px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${({ theme }) => theme.media.laptopM} {
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;

    padding: 24px;
    padding-bottom: 24px;
  }
`;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    height: 648px;
    min-height: 0;
    align-items: flex-start;

    display: flex;
    gap: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    display: flex;
    gap: 32px;
  }
`;

const SkeletonDiagonal = keyframes`
  0% {
    transform: rotate(45deg) translateX(-600px);
  }
  100% {
    transform: rotate(45deg) translateX(200px);
  }
`;

const SVideoSkeletonWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  overflow: hidden;

  margin-left: -16px;
  margin-top: 32px;
  width: 100vw;
  height: calc(100vh - 72px);

  .videoSkeletonContainer {
    display: block;

    width: 100%;
    height: 100%;
  }

  .videoSkeleton {
    display: block;
    width: 100%;
    height: 100%;

    &:after {
      width: 200%;
      height: 200%;

      animation-name: ${SkeletonDiagonal};
    }
  }

  ${({ theme }) => theme.media.tablet} {
    width: 284px;
    height: 506px;
    margin-left: initial;
    margin-top: initial;

    flex-shrink: 0;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    .videoSkeleton {
      width: initial;
      height: 100%;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    width: 410px;
    height: 728px;
  }
`;

const SActivitiesContainer = styled.div`
  margin-top: 16px;

  align-items: flex-start;

  display: flex;
  flex-direction: column;
  gap: 16px;

  height: 80vh;

  .headingSkeletonContainer {
    display: block;

    width: 100%;
    height: 16%;
  }

  .headingSkeleton {
    display: block;
    width: 100%;
    height: 100%;

    &:after {
      width: 500%;
      height: 500%;

      animation-name: ${SkeletonDiagonal};
    }
  }

  .activitiesSkeletonContainer {
    display: block;

    width: 100%;
    height: 84%;
  }

  .activitiesSkeleton {
    display: block;
    width: 100%;
    height: 100%;

    &:after {
      width: 600%;
      height: 600%;

      animation-name: ${SkeletonDiagonal};
    }
  }

  ${({ theme }) => theme.media.tablet} {
    margin-top: initial;

    height: 506px;
    max-height: 506px;
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;
    max-height: 728px;
    width: 100%;
  }
`;
