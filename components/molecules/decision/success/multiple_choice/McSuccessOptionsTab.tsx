/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../../redux-store/store';
import GoBackButton from '../../../GoBackButton';
import { TMcOptionWithHighestField } from '../../../../organisms/decision/regular/PostViewMC';
import { fetchCurrentOptionsForMCPost } from '../../../../../api/endpoints/multiple_choice';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import McOptionCard from '../../regular/multiple_choice/McOptionCard';
import Button from '../../../../atoms/Button';
import GradientMask from '../../../../atoms/GradientMask';
import { Mixpanel } from '../../../../../utils/mixpanel';

interface IMcSuccessOptionsTab {
  post: newnewapi.MultipleChoice;
  handleGoBack: () => void;
}

const McSuccessOptionsTab: React.FunctionComponent<IMcSuccessOptionsTab> = ({
  post,
  handleGoBack,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('modal-Post');
  const { user } = useAppSelector((state) => state);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Options
  const [options, setOptions] = useState<TMcOptionWithHighestField[]>([]);
  const [optionsNextPageToken, setOptionsNextPageToken] = useState<
    string | undefined | null
  >('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [loadingOptionsError, setLoadingOptionsError] = useState('');

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } =
    useScrollGradients(containerRef);

  const sortOptions = useCallback(
    (unsortedArr: TMcOptionWithHighestField[]) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < unsortedArr.length; i++) {
        // eslint-disable-next-line no-param-reassign
        unsortedArr[i].isHighest = false;
      }

      const highestOption = unsortedArr.sort(
        (a, b) => (b?.voteCount as number) - (a?.voteCount as number)
      )[0];

      const optionsByUser = user.userData?.userUuid
        ? unsortedArr
            .filter((o) => o.creator?.uuid === user.userData?.userUuid)
            .sort((a, b) => (b?.voteCount as number) - (a?.voteCount as number))
        : [];

      const optionsSupportedByUser = user.userData?.userUuid
        ? unsortedArr
            .filter((o) => o.isSupportedByMe)
            .sort((a, b) => (b?.voteCount as number) - (a?.voteCount as number))
        : [];

      const optionsByVipUsers = unsortedArr
        .filter((o) => o.isCreatedBySubscriber)
        .sort((a, b) => {
          return (b.id as number) - (a.id as number);
        });

      const workingArrSorted = unsortedArr.sort(
        (a, b) => (b?.voteCount as number) - (a?.voteCount as number)
      );

      const joinedArr = [
        ...(highestOption &&
        highestOption.creator?.uuid === user.userData?.userUuid
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
        workingSortedUnique as TMcOptionWithHighestField[]
      ).findIndex((o) => o.id === highestOption.id);

      if (workingSortedUnique[highestOptionIdx]) {
        workingSortedUnique[highestOptionIdx].isHighest = true;
      }

      return workingSortedUnique;
    },
    [user.userData?.userUuid]
  );

  const fetchOptions = useCallback(
    async (pageToken?: string) => {
      if (optionsLoading) return;
      try {
        setOptionsLoading(true);
        setLoadingOptionsError('');

        const getCurrentOptionsPayload = new newnewapi.GetMcOptionsRequest({
          postUuid: post.postUuid,
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });

        const res = await fetchCurrentOptionsForMCPost(
          getCurrentOptionsPayload
        );

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data && res.data.options) {
          setOptions((curr) => {
            const workingArr = [
              ...curr,
              ...(res.data?.options as TMcOptionWithHighestField[]),
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
    [optionsLoading, setOptions, sortOptions, post]
  );
  useEffect(() => {
    setOptions([]);
    setOptionsNextPageToken('');
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

  useEffect(() => {
    if (inView && !optionsLoading && optionsNextPageToken) {
      fetchOptions(optionsNextPageToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, optionsNextPageToken, optionsLoading]);

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
          <McOptionCard
            key={option.id.toString()}
            option={option as TMcOptionWithHighestField}
            creator={option.creator ?? post.creator!!}
            postId={post.postUuid}
            isCreatorsBid={
              !option.creator || option.creator?.uuid === post.creator?.uuid
            }
            postCreatorName=''
            postText=''
            index={i}
            noAction
            handleSetPaymentSuccessValue={() => {}}
            handleAddOrUpdateOptionFromResponse={() => {}}
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
                _component: 'McSuccessOptionsTab',
              });
            }}
            onClick={() => fetchOptions(optionsNextPageToken)}
          >
            {t('loadMoreButton')}
          </SLoadMoreBtn>
        ) : null}
      </SBidsContainer>
    </SWrapper>
  );
};

export default McSuccessOptionsTab;

const SWrapper = styled.div``;

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
