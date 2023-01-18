/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../../redux-store/store';
import { TAcOptionWithHighestField } from '../../../../../utils/hooks/useAcOptions';
import { fetchCurrentBidsForPost } from '../../../../../api/endpoints/auction';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import { Mixpanel } from '../../../../../utils/mixpanel';

import Button from '../../../../atoms/Button';
import Lottie from '../../../../atoms/Lottie';
import AcOptionCard from '../../regular/auction/AcOptionCard';
import GradientMask from '../../../../atoms/GradientMask';

import loadingAnimation from '../../../../../public/animations/logo-loading-blue.json';
import getDisplayname from '../../../../../utils/getDisplayname';

interface IAcWaitingOptionsSection {
  post: newnewapi.Auction;
}

const AcWaitingOptionsSection: React.FunctionComponent<
  IAcWaitingOptionsSection
> = ({ post }) => {
  const { t } = useTranslation('page-Post');
  const { user } = useAppSelector((state) => state);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Options
  const [options, setOptions] = useState<TAcOptionWithHighestField[]>([]);
  const [optionsNextPageToken, setOptionsNextPageToken] = useState<
    string | undefined | null
  >('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [, setLoadingOptionsError] = useState('');

  // Scroll block
  const [isScrollBlocked, setIsScrollBlocked] = useState(false);

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } = useScrollGradients(
    containerRef,
    options.length > 0
  );

  const sortOptions = useCallback(
    (unsortedArr: TAcOptionWithHighestField[]) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < unsortedArr.length; i++) {
        // eslint-disable-next-line no-param-reassign
        unsortedArr[i].isHighest = false;
      }

      const highestOption = unsortedArr.sort(
        (a, b) =>
          (b?.totalAmount?.usdCents as number) -
          (a?.totalAmount?.usdCents as number)
      )[0];

      unsortedArr.forEach((option, i) => {
        if (i > 0) {
          // eslint-disable-next-line no-param-reassign
          option.isHighest = false;
        }
      });

      const optionsByUser = user.userData?.userUuid
        ? unsortedArr
            .filter((o) => o.creator?.uuid === user.userData?.userUuid)
            .sort((a, b) => {
              return (b.id as number) - (a.id as number);
            })
        : [];

      const optionsSupportedByUser = user.userData?.userUuid
        ? unsortedArr
            .filter((o) => o.isSupportedByMe)
            .sort((a, b) => {
              return (b.id as number) - (a.id as number);
            })
        : [];

      const optionsByVipUsers = unsortedArr
        .filter((o) => o.isCreatedBySubscriber)
        .sort((a, b) => {
          return (b.id as number) - (a.id as number);
        });

      const workingArrSorted = unsortedArr.sort((a, b) => {
        // Sort the rest by newest first
        return (b.id as number) - (a.id as number);
      });

      const joinedArr = [
        ...(highestOption &&
        (highestOption.creator?.uuid === user.userData?.userUuid ||
          highestOption.isSupportedByMe)
          ? [highestOption]
          : []),
        ...optionsByUser,
        ...optionsSupportedByUser,
        ...optionsByVipUsers,
        ...(highestOption &&
        highestOption.creator?.uuid !== user.userData?.userUuid
          ? [highestOption]
          : []),
        ...workingArrSorted,
      ];

      const workingSortedUnique =
        joinedArr.length > 0 ? [...new Set(joinedArr)] : [];

      const highestOptionIdx = (
        workingSortedUnique as TAcOptionWithHighestField[]
      ).findIndex((o) => o.id === highestOption.id);

      if (workingSortedUnique[highestOptionIdx]) {
        (
          workingSortedUnique[highestOptionIdx] as TAcOptionWithHighestField
        ).isHighest = true;
      }

      return workingSortedUnique;
    },
    [user.userData?.userUuid]
  );

  const fetchBids = useCallback(
    async (pageToken?: string) => {
      if (optionsLoading) return;
      try {
        setOptionsLoading(true);
        setLoadingOptionsError('');

        const getCurrentBidsPayload = new newnewapi.GetAcOptionsRequest({
          postUuid: post.postUuid,
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });

        const res = await fetchCurrentBidsForPost(getCurrentBidsPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data && res.data.options) {
          setOptions((curr) => {
            const workingArr = [
              ...curr,
              ...(res.data?.options as TAcOptionWithHighestField[]),
            ];

            return sortOptions(workingArr);
          });
          setOptionsNextPageToken(res.data.paging?.nextPageToken);
        }

        setOptionsLoading(false);
      } catch (err) {
        setOptionsLoading(false);
        setLoadingOptionsError((err as Error).message);
        console.error(err);
      }
    },
    [post, setOptions, sortOptions, optionsLoading]
  );

  const handleRemoveOption = useCallback(
    (optionToRemove: newnewapi.Auction.Option) => {
      setOptions((curr) => {
        const workingArr = [...curr];
        const workingArrUnsorted = [
          ...workingArr.filter((o) => o.id !== optionToRemove.id),
        ];
        return sortOptions(workingArrUnsorted);
      });
    },
    [setOptions, sortOptions]
  );

  useEffect(() => {
    setOptions([]);
    setOptionsNextPageToken('');
    fetchBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

  useEffect(() => {
    if (inView && !optionsLoading && optionsNextPageToken) {
      fetchBids(optionsNextPageToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, optionsNextPageToken, optionsLoading]);

  return (
    <SWrapper>
      {options.length === 0 && optionsLoading && (
        <SLoadingSpinnerDiv>
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        </SLoadingSpinnerDiv>
      )}
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
        style={{
          ...(isScrollBlocked
            ? {
                overflow: 'hidden',
                width:
                  options.length > 4
                    ? 'calc(100% + 10px)'
                    : 'calc(100% + 14px)',
              }
            : {}),
        }}
      >
        {options.map((option, i) => (
          <AcOptionCard
            key={option.id.toString()}
            option={option as TAcOptionWithHighestField}
            optionBeingSupported=''
            postUuid={post.postUuid}
            postShortId={post.postShortId ?? ''}
            postCreatorName={getDisplayname(post.creator)}
            postDeadline=''
            postText=''
            index={i}
            minAmount={0}
            votingAllowed={false}
            handleSetSupportedBid={() => {}}
            handleAddOrUpdateOptionFromResponse={() => {}}
            handleRemoveOption={() => {
              Mixpanel.track('Removed Option', {
                _stage: 'Post',
                _postUuid: post.postUuid,
                _component: 'AcOptionsTab',
              });
              handleRemoveOption(option);
            }}
            handleSetScrollBlocked={() => setIsScrollBlocked(true)}
            handleUnsetScrollBlocked={() => setIsScrollBlocked(false)}
          />
        ))}
        {!isMobile ? (
          <SLoaderDiv ref={loadingRef} />
        ) : optionsNextPageToken ? (
          <SLoadMoreBtn
            view='secondary'
            onClickCapture={() => {
              Mixpanel.track('Click Load More', {
                _stage: 'Post',
                _postUuid: post.postUuid,
                _component: 'AcWaitingOptionsTab',
              });
            }}
            onClick={() => fetchBids(optionsNextPageToken)}
          >
            {t('loadMoreButton')}
          </SLoadMoreBtn>
        ) : null}
      </SBidsContainer>
    </SWrapper>
  );
};

export default AcWaitingOptionsSection;

const SWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  ${({ theme }) => theme.media.tablet} {
    flex: 1 1 auto;
  }
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

const SLoadingSpinnerDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  top: calc(50% - 32px);
  left: calc(50% - 32px);
`;
