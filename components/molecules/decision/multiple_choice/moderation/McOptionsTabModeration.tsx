/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useAppSelector } from '../../../../../redux-store/store';
import { TMcOptionWithHighestField } from '../../../../organisms/decision/PostViewMC';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import McOptionCardModeration from './McOptionCardModeration';
import GradientMask from '../../../../atoms/GradientMask';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';

interface IMcOptionsTabModeration {
  post: newnewapi.MultipleChoice;
  options: newnewapi.MultipleChoice.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  handleLoadOptions: (token?: string) => void;
  handleRemoveOption: (optionToRemove: newnewapi.MultipleChoice.Option) => void;
}

const McOptionsTabModeration: React.FunctionComponent<IMcOptionsTabModeration> = ({
  post,
  options,
  optionsLoading,
  pagingToken,
  minAmount,
  handleLoadOptions,
  handleRemoveOption,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } = useScrollGradients(containerRef);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadOptions(pagingToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  return (
    <>
      <STabContainer
        key="bids"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SBidsContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
        >
          {!isMobile ? (
            <>
              <GradientMask gradientType="secondary" positionTop active={showTopGradient} />
              <GradientMask gradientType="secondary" positionBottom={0} active={showBottomGradient} />
            </>
          ) : null}
          {options.map((option, i) => (
            <McOptionCardModeration
              index={i}
              key={option.id.toString()}
              option={option as TMcOptionWithHighestField}
              creator={option.creator ?? post.creator!!}
              postId={post.postUuid}
            />
          ))}
          {!isMobile ? (
            <SLoaderDiv
              ref={loadingRef}
            />
          ) : (
            pagingToken ? (
              (
                <SLoadMoreBtn
                  onClick={() => handleLoadOptions(pagingToken)}
                >
                  { t('loadMoreBtn') }
                </SLoadMoreBtn>
              )
            ) : null
          )}
        </SBidsContainer>
      </STabContainer>
    </>
  );
};

McOptionsTabModeration.defaultProps = {
};

export default McOptionsTabModeration;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: calc(100% - 56px);
`;

const SBidsContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  // Scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  scrollbar-width: none;
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
    transition: .2s linear;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
    transition: .2s linear;
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
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)`

`;
