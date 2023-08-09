/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FetchNextPageOptions, InfiniteQueryObserverResult } from 'react-query';

import { Mixpanel } from '../../../../../utils/mixpanel';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import { TMcOptionWithHighestField } from '../../../../../utils/hooks/useMcOptions';

import Button from '../../../../atoms/Button';
import GradientMask from '../../../../atoms/GradientMask';
import McOptionCardModeration from './McOptionCardModeration';
import { useAppState } from '../../../../../contexts/appStateContext';

interface IMcOptionsTabModeration {
  post: newnewapi.MultipleChoice;
  options: newnewapi.MultipleChoice.Option[];
  winningOptionId?: number;
  hasNextPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<
    InfiniteQueryObserverResult<
      {
        mcOptions: newnewapi.MultipleChoice.IOption[];
        paging: newnewapi.IPagingResponse | null | undefined;
      },
      unknown
    >
  >;
  handleRemoveOption: (optionToRemove: newnewapi.MultipleChoice.Option) => void;
}

const McOptionsTabModeration: React.FunctionComponent<
  IMcOptionsTabModeration
> = ({
  post,
  options,
  winningOptionId,
  hasNextPage,
  fetchNextPage,
  handleRemoveOption,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Scroll block
  const [isScrollBlocked, setIsScrollBlocked] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } =
    useScrollGradients(containerRef);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const scrollable =
        containerRef?.current &&
        containerRef?.current?.scrollHeight >
          containerRef?.current?.clientHeight;
      setIsScrollable(!!scrollable);
    });

    if (containerRef?.current) {
      resizeObserver.observe(containerRef?.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <STabContainer
        key='bids'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
        <SBidsContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
          style={{
            ...(isScrollBlocked
              ? {
                  overflow: 'hidden',
                  width: isScrollable
                    ? 'calc(100% + 10px)'
                    : 'calc(100% + 14px)',
                }
              : {}),
          }}
        >
          {options.map((option, i) => (
            <McOptionCardModeration
              index={i}
              key={option.id.toString()}
              option={option as TMcOptionWithHighestField}
              canBeDeleted={options.length > 2}
              isWinner={winningOptionId?.toString() === option.id.toString()}
              isCreatorsOption={
                !option.creator || option.creator?.uuid === post.creator?.uuid
              }
              handleRemoveOption={() => handleRemoveOption(option)}
              handleSetScrollBlocked={() => setIsScrollBlocked(true)}
              handleUnsetScrollBlocked={() => setIsScrollBlocked(false)}
            />
          ))}
          {hasNextPage ? (
            !isMobile ? (
              <SLoaderDiv ref={loadingRef} />
            ) : (
              <SLoadMoreBtn
                onClickCapture={() => {
                  Mixpanel.track('Click Load More', {
                    _stage: 'Post',
                    _postUuid: post.postUuid,
                    _component: 'McOptionsTabModeration',
                  });
                }}
                onClick={() => fetchNextPage()}
              >
                {t('loadMoreButton')}
              </SLoadMoreBtn>
            )
          ) : null}
        </SBidsContainer>
      </STabContainer>
    </>
  );
};

McOptionsTabModeration.defaultProps = {};

export default McOptionsTabModeration;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  ${({ theme }) => theme.media.tablet} {
    flex: 1 1 auto;
  }
`;

const SBidsContainer = styled.div`
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

const SLoadMoreBtn = styled(Button)``;
