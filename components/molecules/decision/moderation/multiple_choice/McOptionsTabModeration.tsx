/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useAppSelector } from '../../../../../redux-store/store';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import { TMcOptionWithHighestField } from '../../../../organisms/decision/regular/PostViewMC';

import Button from '../../../../atoms/Button';
import GradientMask from '../../../../atoms/GradientMask';
import McOptionCardModeration from './McOptionCardModeration';
import { Mixpanel } from '../../../../../utils/mixpanel';

interface IMcOptionsTabModeration {
  post: newnewapi.MultipleChoice;
  options: newnewapi.MultipleChoice.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  winningOptionId?: number;
  handleLoadOptions: (token?: string) => void;
  handleRemoveOption: (optionToRemove: newnewapi.MultipleChoice.Option) => void;
}

const McOptionsTabModeration: React.FunctionComponent<
  IMcOptionsTabModeration
> = ({
  post,
  options,
  optionsLoading,
  pagingToken,
  winningOptionId,
  handleLoadOptions,
  handleRemoveOption,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Scroll block
  const [isScrollBlocked, setIsScrollBlocked] = useState(false);

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } =
    useScrollGradients(containerRef);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadOptions(pagingToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

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
                  width:
                    options.length > 4
                      ? 'calc(100% + 10px)'
                      : 'calc(100% + 14px)',
                }
              : {}),
          }}
        >
          {/* Seems like every option has a creator now. */}
          {/* TODO: confirm, update types, remove unnecessary parameter 'creator'. */}
          {options.map((option, i) => (
            <McOptionCardModeration
              index={i}
              key={option.id.toString()}
              option={option as TMcOptionWithHighestField}
              creator={option.creator ?? post.creator!!}
              canBeDeleted={options.length > 2}
              isWinner={winningOptionId?.toString() === option.id.toString()}
              isCreatorsBid={
                !option.creator || option.creator?.uuid === post.creator?.uuid
              }
              handleRemoveOption={() => handleRemoveOption(option)}
              handleSetScrollBlocked={() => setIsScrollBlocked(true)}
              handleUnsetScrollBlocked={() => setIsScrollBlocked(false)}
            />
          ))}
          {!isMobile ? (
            <SLoaderDiv ref={loadingRef} />
          ) : pagingToken ? (
            <SLoadMoreBtn
              onClickCapture={() => {
                Mixpanel.track('Click Load More', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'McOptionsTabModeration',
                });
              }}
              onClick={() => handleLoadOptions(pagingToken)}
            >
              {t('loadMoreButton')}
            </SLoadMoreBtn>
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
